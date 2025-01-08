import argparse
import cv2
import os
import time
import numpy as np
import torch
import imageio
from PIL import Image

from actions.dataset.transforms import BaseTransform
from actions.utils.misc import load_weight
from actions.utils.box_ops import rescale_bboxes
from actions.utils.vis_tools import vis_detection
from actions.config import build_dataset_config, build_model_config
from actions.models import build_model
from actions import action_args


def multi_hot_vis(args, frame, out_bboxes, orig_w, orig_h, class_names, act_pose=False):
    # visualize detection results
    yowo_bbox = []
    return_text = []
    # print(np.shape(out_bboxes))
    
    for bbox in out_bboxes:
        # print('one')
        x1, y1, x2, y2 = bbox[:4]
        if act_pose:
            # only show 14 poses of AVA.
            cls_conf = bbox[5:5+14]
        else:
            # show all actions of AVA.
            cls_conf = bbox[5:5+len(class_names)]
    
        # rescale bbox
        x1, x2 = int(x1 * orig_w), int(x2 * orig_w)
        y1, y2 = int(y1 * orig_h), int(y2 * orig_h)

        new_bbox = [x1, y1, x2, y2]

        # score = obj * cls
        det_conf = float(bbox[4])
        cls_scores = np.sqrt(det_conf * cls_conf)

        # indices = np.where(cls_scores > args.vis_thresh)
        temp_indices = np.zeros(cls_scores.shape, dtype=bool)
        temp_indices[0] = cls_scores[0] > args.vis_thresh + 0.20 # for raising hand
        temp_indices[1:] = cls_scores[1:] > args.vis_thresh # for remaining classes i.e. interaction and mobile phone 

        indices = np.where(temp_indices == True)

        scores = cls_scores[indices]
        # indices = list(indices[0])
        indices = list(indices[0])
        scores = list(scores)



        if len(scores) > 0:
            # draw bbox
            # cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            # draw text
            blk   = np.zeros(frame.shape, np.uint8)
            font  = cv2.FONT_HERSHEY_SIMPLEX
            coord = []
            text  = []
            text_size = []
            yowo_bbox.append(new_bbox)

            for _, cls_ind in enumerate(indices):
                text.append("[{:.2f}] ".format(scores[_]) + str(class_names[cls_ind]))
                text_size.append(cv2.getTextSize(text[-1], font, fontScale=0.5, thickness=1)[0])
                coord.append((x1+3, y1+14+20*_))
                # cv2.rectangle(blk, (coord[-1][0]-1, coord[-1][1]-12), (coord[-1][0]+text_size[-1][0]+1, coord[-1][1]+text_size[-1][1]-4), (0, 255, 0), cv2.FILLED)
            frame = cv2.addWeighted(frame, 1.0, blk, 0.5, 1)
            
            for t in range(len(text)):
                cv2.putText(frame, text[t], coord[t], font, 0.5, (0, 0, 0), 1)

            return_text.append(text)

    return frame, return_text, yowo_bbox


@torch.no_grad()
def detect(args, frame, model, device, transform, class_names, class_colors):

    video_clip = []

    frame_rgb = frame[..., (2, 1, 0)]
    #print(frame_rgb.shape)

    # to PIL image
    frame_pil = Image.fromarray(frame_rgb.astype(np.uint8))

    # prepare

    for _ in range(args.len_clip):
        video_clip.append(frame_pil)

    video_clip.append(frame_pil)
    del video_clip[0]

    # orig size
    orig_h, orig_w = frame.shape[:2]

    # transform
    x, _ = transform(video_clip)
    # List [T, 3, H, W] -> [3, T, H, W]
    x = torch.stack(x, dim=1)
    x = x.unsqueeze(0).to(device) # [B, 3, T, H, W], B=1

    t0 = time.time()
    outputs = model(x)


    batch_bboxes = outputs
    # batch size = 1
    bboxes = batch_bboxes[0]
    # print("bboxes")
    # multi hot
    ann_frame, action_text, action_bbox = multi_hot_vis(
        args=args,
        frame=frame,
        out_bboxes=bboxes,
        orig_w=orig_w,
        orig_h=orig_h,
        class_names=class_names,
        act_pose=args.pose
        )

    return action_bbox, action_text

import numpy as np

def calculate_iou(bbox_a, bbox_b):
        # Determine the coordinates of the intersection rectangle
        x_left = max(bbox_a[0], bbox_b[0])
        y_top = max(bbox_a[1], bbox_b[1])
        x_right = min(bbox_a[2], bbox_b[2])
        y_bottom = min(bbox_a[3], bbox_b[3])

        if x_right < x_left or y_bottom < y_top:
            return 0.0  # No intersection

        intersection_area = (x_right - x_left) * (y_bottom - y_top)
        bbox_a_area = (bbox_a[2] - bbox_a[0]) * (bbox_a[3] - bbox_a[1])
        bbox_b_area = (bbox_b[2] - bbox_b[0]) * (bbox_b[3] - bbox_b[1])
        union_area = bbox_a_area + bbox_b_area - intersection_area

        iou = intersection_area / union_area
        return iou

def load_model():
    np.random.seed(100)
    #args = parse_args()
    args = action_args

    # cuda
    if args.cuda:
        # print('use cuda')
        device = torch.device("cuda")
    else:
        device = torch.device("cpu")

    # config
    d_cfg = build_dataset_config(args)
    m_cfg = build_model_config(args)

    class_names = d_cfg['label_map']
    num_classes = d_cfg['valid_num_classes']

    class_colors = [(np.random.randint(255),
                     np.random.randint(255),
                     np.random.randint(255)) for _ in range(num_classes)]

    # transform
    basetransform = BaseTransform(img_size=args.img_size)

    # build model
    model, _ = build_model(
        args=args,
        d_cfg=d_cfg,
        m_cfg=m_cfg,
        device=device, 
        num_classes=num_classes, 
        trainable=False
        )

    # load trained weight
    model = load_weight(model=model, path_to_ckpt=args.weight)

    # to eval
    model = model.to(device).eval()

    return args,model,device,basetransform,class_names,class_colors

def action_detection (frame, outputs,model,args,device,basetransform,class_names,class_colors):

    # run
    action_bbox, action_text = detect(args=args,
            frame = frame,
            model=model,
            device=device,
            transform=basetransform,
            class_names=class_names,
            class_colors=class_colors)

    action = ["No action"] * len(outputs)

    if len(outputs) > 0 and len(action_bbox) > 0:
        for a_idx, act_bbox in enumerate(action_bbox):

            for h_idx, head_det in enumerate(outputs):

                if (calculate_iou(act_bbox, head_det) > action_args.iou_threshold):

                    action[h_idx] = action_text[a_idx]

    return action




