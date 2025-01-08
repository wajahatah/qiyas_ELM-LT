import torch
import numpy as np
import pathlib
temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath
import cv2
from ultralytics import YOLO
import time
import json
import os
import datetime
class YoloV5headdetector:
    def __init__(self):

        self.head_model = torch.hub.load("ultralytics/yolov5","custom","models_1/best_head_stand_hand.pt")
        self.head_model.conf = 0.25
        self.head_stride, self.head_pt = self.head_model.stride, self.head_model.pt
        self.debug_dir = "debug_dir"
        ## Old Yolov5 code 
        # self.hand_raised_model = torch.hub.load("ultralytics/yolov5","custom","models_1/best_hand_raised.pt")
        # self.hand_raised_model.conf = 0.7
        # self.hand_raised_stride, self.hand_raised_pt = self.hand_raised_model.stride, self.hand_raised_model.pt
        ## End Yolov5 code

        ## New Yolov10 code 
        self.hand_raised_model = YOLO("models_1/best_hand_raised_yolov10m.pt", task="detect")
        empty_input = torch.empty(1, 3, 640, 640).to('cuda')  # Move to GPU if using CUDA
        with torch.no_grad():  # Disable gradient calculation for inference
            _ = self.hand_raised_model(empty_input)

    def letterbox(self, im, new_shape=(640, 640), color=(114, 114, 114), auto=True, scaleFill=False, scaleup=True, stride=32):
        """Resizes and pads image to new_shape with stride-multiple constraints, returns resized image, ratio, padding."""
        shape = im.shape[:2]  # current shape [height, width]
        if isinstance(new_shape, int):
            new_shape = (new_shape, new_shape)

        # Scale ratio (new / old)
        r = min(new_shape[0] / shape[0], new_shape[1] / shape[1])
        if not scaleup:  # only scale down, do not scale up (for better val mAP)
            r = min(r, 1.0)

        # Compute padding
        ratio = r, r  # width, height ratios
        new_unpad = int(round(shape[1] * r)), int(round(shape[0] * r))
        dw, dh = new_shape[1] - new_unpad[0], new_shape[0] - new_unpad[1]  # wh padding
        if auto:  # minimum rectangle
            dw, dh = np.mod(dw, stride), np.mod(dh, stride)  # wh padding
        elif scaleFill:  # stretch
            dw, dh = 0.0, 0.0
            new_unpad = (new_shape[1], new_shape[0])
            ratio = new_shape[1] / shape[1], new_shape[0] / shape[0]  # width, height ratios

        dw /= 2  # divide padding into 2 sides
        dh /= 2

        if shape[::-1] != new_unpad:  # resize
            im = cv2.resize(im, new_unpad, interpolation=cv2.INTER_LINEAR)
        top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
        left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
        im = cv2.copyMakeBorder(im, top, bottom, left, right, cv2.BORDER_CONSTANT, value=color)  # add border
        return im, ratio, (dw, dh)
    
    def img_prepare (self, frame, stride, pt):

        frame2 = self.letterbox(frame, 640, stride=stride, auto=pt)[0]  # padded resize
        frame2 = frame2.transpose((2, 0, 1))[::-1]  # HWC to CHW, BGR to RGB
        frame2 = np.ascontiguousarray(frame2)

        return frame2
    
    def clip_boxes(self, boxes, shape):
        """Clips bounding box coordinates (xyxy) to fit within the specified image shape (height, width)."""
        if isinstance(boxes, torch.Tensor):  # faster individually
            boxes[..., 0].clamp_(0, shape[1])  # x1
            boxes[..., 1].clamp_(0, shape[0])  # y1
            boxes[..., 2].clamp_(0, shape[1])  # x2
            boxes[..., 3].clamp_(0, shape[0])  # y2
        else:  # np.array (faster grouped)
            boxes[..., [0, 2]] = boxes[..., [0, 2]].clip(0, shape[1])  # x1, x2
            boxes[..., [1, 3]] = boxes[..., [1, 3]].clip(0, shape[0])  # y1, y2
    
    def scale_boxes(self, img1_shape, boxes, img0_shape, ratio_pad=None):
        """Rescales (xyxy) bounding boxes from img1_shape to img0_shape, optionally using provided `ratio_pad`."""
        if ratio_pad is None:  # calculate from img0_shape

            gain = min(img1_shape[0] / img0_shape[0], img1_shape[1] / img0_shape[1])  # gain  = old / new
            pad = (img1_shape[1] - img0_shape[1] * gain) / 2, (img1_shape[0] - img0_shape[0] * gain) / 2  # wh padding
        else:
            gain = ratio_pad[0][0]
            pad = ratio_pad[1]

        boxes = boxes.clone() 
        boxes[..., [0, 2]] -= pad[0]  # x padding
        boxes[..., [1, 3]] -= pad[1]  # y padding
        boxes[..., :4] /= gain
        self.clip_boxes(boxes, img0_shape)
        return boxes
    
    def calculate_iou(self, bbox_a, bbox_b):
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

    def head_bbox(self, frame, desk_roi):

        frame_preprocess = self.img_prepare (frame, self.head_stride, self.head_pt)
        all_bboxes = self.head_model(frame_preprocess).xyxy[0]

        if len(frame_preprocess.shape) == 3:
            frame_preprocess = frame_preprocess[None]

        frame_preprocess_1 = frame_preprocess.shape[2:]
        all_bboxes = all_bboxes.clone() 
        all_bboxes[:, :4] = self.scale_boxes(frame_preprocess_1, all_bboxes[:, :4], frame.shape).round()

        head_bboxes = all_bboxes[all_bboxes[:, 5] == 0]
        stand_bboxes = all_bboxes[all_bboxes[:, 5] == 2]

        iou_threshold = 0.04

        ## filter heads that are also found to be standing
        filtered_head_bboxes = []
        stand_flag = []
        stand_head = []
        for head in head_bboxes:
            inside_any_class_1 = any(self.calculate_iou(head, stand) > iou_threshold for stand in stand_bboxes)
            if not inside_any_class_1:
                filtered_head_bboxes.append(head)
                stand_flag.append(0)
            else:
                stand_flag.append(1)
                stand_head.append(head)

        filtered_head_bboxes = torch.stack(filtered_head_bboxes) if filtered_head_bboxes else torch.empty((0, 6), device='cuda:0')
        
        head_bboxes_clone = filtered_head_bboxes.clone()

        # Calculate the center, width, and height of each bounding box with 20% padding
        center_x = (head_bboxes_clone[:, 0] + head_bboxes_clone[:, 2]) / 2
        center_y = (head_bboxes_clone[:, 1] + head_bboxes_clone[:, 3]) / 2
        width = (head_bboxes_clone[:, 2] - head_bboxes_clone[:, 0]) * 1.3
        height = (head_bboxes_clone[:, 3] - head_bboxes_clone[:, 1]) * 1.3

        # Update the coordinates to increase the size of the bounding boxes
        head_bboxes_clone[:, 0] = center_x - width / 2
        head_bboxes_clone[:, 1] = center_y - height / 2
        head_bboxes_clone[:, 2] = center_x + width / 2 #1275 if (center_x + width / 2) > 1280 else (center_x + width / 2)
        head_bboxes_clone[:, 3] = center_y + height / 2
        ## make shure to keep the x2 of each head to be within frame range (1280,720) 
        head_bboxes_clone[:, 2] = torch.where(head_bboxes_clone[:, 2] > 1280, torch.tensor(1275.0, device='cuda:0'), head_bboxes_clone[:, 2])
        
        ## Filtration of all heads that lies outside desk ROIs
        filtered_2_head_bboxes = []
        head_bbox_dict ={}
        for h_bbox in head_bboxes_clone:
            x1, y1, x2, y2 = h_bbox[:4]
            center_point = ((x1+x2)/2,(y1+y2)/2)
            for desk, roi in desk_roi.items():

                if int(center_point[0]) > roi["xmin"] and int(center_point[0]) < roi["xmax"] and int(center_point[1]) >= roi["ymin"] and int(center_point[1]) <= roi["ymax"]:
                    filtered_2_head_bboxes.append(h_bbox)
                    head_bbox_dict[desk] = h_bbox
                    break  # If it lies within one ROI, no need to check further

        return filtered_2_head_bboxes, stand_flag, stand_bboxes,stand_head,head_bbox_dict
    
    def check_hand_raised(self,frame,head_bb):
        ## Old Yolov5 Code
        # frame_preprocess = self.img_prepare (frame, self.hand_raised_stride, self.hand_raised_pt) ## preprocessing
        # all_bboxes = self.hand_raised_model(frame_preprocess).xyxy[0] ## prediction

        ## Post Processing
        # if len(frame_preprocess.shape) == 3:
        #     frame_preprocess = frame_preprocess[None]

        # frame_preprocess_1 = frame_preprocess.shape[2:]
        # all_bboxes = all_bboxes.clone() 
        # all_bboxes[:, :4] = self.scale_boxes(frame_preprocess_1, all_bboxes[:, :4], frame.shape).round()
        ## End of yolov5 Code
        hand_bboxes = []
        if len(head_bb)> 0:
        ## New Yolov10 Code
            with torch.no_grad():
                results = self.hand_raised_model(frame,conf = 0.3, verbose=False,device="cuda:0")
            all_bboxes = results[0].boxes.xyxy
            ## New Yolov10 Code

            if len(all_bboxes) > 0:
                # hand_bboxes = all_bboxes[all_bboxes[:, 5] == 0] ## Yolov5 
                hand_bboxes = all_bboxes
                ### Debug Code ###
                today = datetime.date.today()
                date_string = today.strftime("%Y-%m-%d")
                person_folder = f"{self.debug_dir}/{date_string}"
                os.makedirs(person_folder, exist_ok=True)
                file_name = str(time.time())
                out_file = open(f"{person_folder}/{file_name}.json", "w")
                cv2.imwrite(f"{person_folder}/{file_name}.jpg",frame)
                json.dump(all_bboxes.tolist(), out_file, indent = 6)
                out_file.close()
                ### Debug End ###
                iou_threshold = 0.1
                hand_raised_flag = []
                for head in head_bb:
                    inside_any_class_1 = any(self.calculate_iou(head, hand) > iou_threshold for hand in hand_bboxes)
                    if inside_any_class_1:
                        hand_raised_flag.append(1)
                    else:
                        hand_raised_flag.append(0)
            else:
                hand_raised_flag = [0] * len(head_bb)
        else:
            hand_raised_flag = [0] * len(head_bb)
        
        return hand_raised_flag , hand_bboxes
    
