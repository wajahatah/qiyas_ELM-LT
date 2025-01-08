import numpy as np
import argparse
import torch
from torchvision.transforms import transforms
import matplotlib.pyplot as plt
from PIL import Image
import cv2

from gazetarget.multimodal.config import get_config
from gazetarget.multimodal.models import get_model, load_pretrained
from gazetarget.multimodal.datasets.transforms.ToColorMap import ToColorMap



from gazetarget.multimodal.utils import (
    get_heatmap_peak_coords,
    get_memory_format,
    get_head_mask
)

from detection.detector import Base_Detector



class GazeDetection():
    def __init__(self) :
            self.roi_id = []
            self.gaze_x = 0
            self.gaze_y = 0


class MultiModalGazeTarget(Base_Detector):
    def __init__(self):
        self.config = get_config()


        self.input_size = self.config.input_size
        self.output_size = self.config.output_size

        # self.is_test_set = is_test_set
        self.head_bbox_overflow_coeff = 0.1  # Will increase/decrease the bbox of the head by this value (%)
        self.image_transform = transforms.Compose(
            [
                transforms.Resize((self.input_size, self.input_size)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ]
        )
        self.depth_transform = transforms.Compose(
            [ToColorMap(plt.get_cmap("magma")), transforms.Resize((self.input_size, self.input_size)), transforms.ToTensor()]
        )

        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Running on {self.device}")

        # Load model
        print("Loading model")
        model = get_model(self.config, device=self.device)


        # Do an evaluation or continue and prepare training
        # if config.eval_weights:
        print("Preparing evaluation")

        pretrained_dict = torch.load("./models/ckpt_epoch_best.pth", map_location=self.device)  #d7dec6bbffe9007781cbd4517632f5f3.pth
        pretrained_dict = pretrained_dict.get("model_state_dict") or pretrained_dict.get("model")

        self.model = load_pretrained(model, pretrained_dict)
        self.model.eval()


    def run_overSingleFrame(self, img, depth, head_bbox):

        x_min = head_bbox[0]
        y_min = head_bbox[1]
        x_max = head_bbox[2]
        y_max = head_bbox[3]

        img = img.convert("RGB")
        img_cp = np.array(img.copy())
        width, height = img.size

        # Expand face bbox a bit
        x_min -= self.head_bbox_overflow_coeff * abs(x_max - x_min)
        y_min -= self.head_bbox_overflow_coeff * abs(y_max - y_min)
        x_max += self.head_bbox_overflow_coeff * abs(x_max - x_min)
        y_max += self.head_bbox_overflow_coeff * abs(y_max - y_min)

        x_min, y_min, x_max, y_max = map(float, [x_min, y_min, x_max, y_max])

        head = get_head_mask(x_min, y_min, x_max, y_max, width, height, resolution=self.input_size).unsqueeze(0)

        # Crop the face
        face = img.crop((int(x_min), int(y_min), int(x_max), int(y_max)))

        # Load depth image
        depth = depth.convert("L")

        # Apply transformation to images...
        if self.image_transform is not None:
            img = self.image_transform(img)
            face = self.image_transform(face)

        # ... and depth
        if self.depth_transform is not None:
            depth = self.depth_transform(depth)

        img = img.to(self.device, non_blocking=True, memory_format=get_memory_format(self.config)).unsqueeze(0)
        depth = depth.to(self.device, non_blocking=True, memory_format=get_memory_format(self.config)).unsqueeze(0)
        face = face.to(self.device, non_blocking=True, memory_format=get_memory_format(self.config)).unsqueeze(0)
        head = head.to(self.device, non_blocking=True, memory_format=get_memory_format(self.config)).unsqueeze(0)

        gaze_heatmap_pred, _, _, _ = self.model(img, depth, head, face)

        gaze_heatmap_pred = gaze_heatmap_pred.squeeze(1).cpu()

        # gaze_heatmap_pred = gaze_heatmap_pred.squeeze(1).cpu()
        pred_x, pred_y = get_heatmap_peak_coords(gaze_heatmap_pred[0])
        norm_p = torch.tensor([pred_x / float(self.config.output_size), pred_y / float(self.config.output_size)])

        converted = list(map(int, [x_min, y_min, x_max, y_max]))
        starting_point = ((converted[0] + converted[2]) // 2, (converted[1] + converted[3]) // 2)
        ending_point = (int(norm_p[0] * img_cp.shape[1]), int(norm_p[1] * img_cp.shape[0]))

        return starting_point, ending_point
    def makeBatch(self, img, depth, cmbHeadBox):
        head_list = []
        depth_list = []
        frame_list = []
        face_list =[]
        for iter, head_box in enumerate(cmbHeadBox):
            img_cp = img.copy()
            depth_cp = depth.copy()
            x_min = head_box[0]
            y_min = head_box[1]
            x_max = head_box[2]
            y_max = head_box[3]

            img_cp = img_cp.convert("RGB")
            width, height = img_cp.size

            # Expand face bbox a bit
            x_min -= self.head_bbox_overflow_coeff * abs(x_max - x_min)
            y_min -= self.head_bbox_overflow_coeff * abs(y_max - y_min)
            x_max += self.head_bbox_overflow_coeff * abs(x_max - x_min)
            y_max += self.head_bbox_overflow_coeff * abs(y_max - y_min)

            x_min, y_min, x_max, y_max = map(float, [x_min, y_min, x_max, y_max])

            head = get_head_mask(x_min, y_min, x_max, y_max, width, height, resolution=self.input_size).unsqueeze(0)

            # Crop the face
            face = img_cp.crop((int(x_min), int(y_min), int(x_max), int(y_max)))

            # Load depth image
            depth_cp = depth_cp.convert("L")

            # Apply transformation to images...
            if self.image_transform is not None:
                img_cp = self.image_transform(img_cp)
                face = self.image_transform(face)

            # ... and depth
            if self.depth_transform is not None:
                depth_cp = self.depth_transform(depth_cp)
            head_list.append(head)
            depth_list.append(depth_cp)
            frame_list.append(img_cp)
            face_list.append(face)



        return head_list, frame_list, depth_list, face_list



    def runOverBatch(self, img, depth, cmbHeadBox):
        img_cp = np.array(img.copy())
        head, img, depth, face = self.makeBatch(img, depth, cmbHeadBox)
        
        head = torch.stack(head)
        img = torch.stack(img)
        depth = torch.stack(depth)
        face = torch.stack(face)


        img = img.to(self.device, non_blocking=True, memory_format=get_memory_format(self.config))
        depth = depth.to(self.device, non_blocking=True, memory_format=get_memory_format(self.config))
        face = face.to(self.device, non_blocking=True, memory_format=get_memory_format(self.config))
        head = head.to(self.device, non_blocking=True, memory_format=get_memory_format(self.config))

        gaze_heatmap_pred, _, _, _ = self.model(img, depth, head, face)

        gaze_heatmap_pred = gaze_heatmap_pred.squeeze(1).cpu()
        return_pnts = []
        for gaze, head_box in zip(gaze_heatmap_pred, cmbHeadBox):
            pred_x, pred_y = get_heatmap_peak_coords(gaze)
            norm_p = torch.tensor([pred_x / float(self.config.output_size), pred_y / float(self.config.output_size)])
    
            converted = list(map(int, head_box))
            starting_point = ((converted[0] + converted[2]) // 2, (converted[1] + converted[3]) // 2)
            ending_point = (int(norm_p[0] * img_cp.shape[1]), int(norm_p[1] * img_cp.shape[0]))
            return_pnts.append([starting_point, ending_point])
        return return_pnts
    
    def predict_gaze_target(self,face_detection, frame_raw, depth_image):
        # cv2.imshow("frame raw", frame_raw)
        # cv2.waitKey(1)
        base_detector = Base_Detector()

        head_list = []
        face_list = []
        frame_list = []
        depth_list = []

        for i in range(len(face_detection)):

            img_cp1 = frame_raw.copy()
            depth_cp1 = depth_image.copy()

            img_cp = Image.fromarray(img_cp1)
            depth_cp = Image.fromarray(depth_cp1)
        

            x_min = np.maximum(0,int(face_detection[i].xmin))#mean_x - 25
            y_min = np.maximum(0,int(face_detection[i].ymin))#mean_y - 25
            x_max = np.minimum(frame_raw.shape[1]-1,int(face_detection[i].xmax))#50
            y_max = np.maximum(frame_raw.shape[0]-1,int(face_detection[i].ymax))#50

            x_min, y_min, x_max, y_max = map(float, [x_min, y_min, x_max, y_max])
            
            img_cp = img_cp.convert("RGB")
            width, height = img_cp.size

            head = get_head_mask(x_min, y_min, x_max, y_max, width, height, resolution=self.input_size).unsqueeze(0)


            # Crop the face
            face = img_cp.crop((int(x_min), int(y_min), int(x_max), int(y_max)))

            # Load depth image
            depth_cp = depth_cp.convert("L")


            # Apply transformation to images...
            if self.image_transform is not None:
                img_cp = self.image_transform(img_cp)
                face = self.image_transform(face)

            # ... and depth
            if self.depth_transform is not None:
                depth_cp = self.depth_transform(depth_cp)


            head_list.append(head)
            depth_list.append(depth_cp)
            frame_list.append(img_cp)
            face_list.append(face)
        
        if len(head_list) > 0 :

            head_list = torch.stack(head_list)
            frame_list = torch.stack(frame_list)
            depth_list = torch.stack(depth_list)
            face_list = torch.stack(face_list)

            frame_list = frame_list.to(self.device, non_blocking=True, memory_format=get_memory_format(self.config))
            depth_list = depth_list.to(self.device, non_blocking=True, memory_format=get_memory_format(self.config))
            face_list = face_list.to(self.device, non_blocking=True, memory_format=get_memory_format(self.config))
            head_list = head_list.to(self.device, non_blocking=True, memory_format=get_memory_format(self.config))

            gaze_heatmap_pred, _, _, _ = self.model(frame_list, depth_list, head_list, face_list)

            gaze_heatmap_pred = gaze_heatmap_pred.squeeze(1).cpu()

            for gaze in gaze_heatmap_pred:
                pred_x, pred_y = get_heatmap_peak_coords(gaze)
                norm_p = torch.tensor([pred_x / float(self.config.output_size), pred_y / float(self.config.output_size)])
        
                # converted = list(map(int, head_box))
                # starting_point = ((converted[0] + converted[2]) // 2, (converted[1] + converted[3]) // 2)
                gaze_point = (int(norm_p[0] * width), int(norm_p[1] * height))
                print("gaze point ::", gaze_point)
                base_detector.gaze_point.append(GazeDetection())
                base_detector.gaze_point[len(base_detector.gaze_point)-1].roi_id = face_detection[len(base_detector.gaze_point)-1].roi_id
                base_detector.gaze_point[len(base_detector.gaze_point)-1].gaze_x = gaze_point[0]
                base_detector.gaze_point[len(base_detector.gaze_point)-1].gaze_y = gaze_point[1]

        return base_detector.gaze_point

