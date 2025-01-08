import torch

import numpy as np
import torch.backends.cudnn as cudnn
from detection.trackers.custom_tracker.yolov7_detector.models.load_model import attempt_load
from detection.trackers.custom_tracker.yolov7_detector.utils.general import check_img_size, non_max_suppression, \
    scale_coords, strip_optimizer
from detection.trackers.custom_tracker.yolov7_detector.utils.torch_utils import select_device
from detection.trackers.custom_tracker.yolov7_detector.utils.custom_utils import letterbox

from detection.trackers.custom_tracker import yolov7_settings as settings



class Detector:
    def __init__(self):
        # Initialize
        self.device = select_device(settings.DEVICE)
        self.half = self.device.type != 'cpu'  # half precision only supported on CUDA
        # Load model

        self.detector = attempt_load(settings.WEIGHT_PATH, model_config=settings.YOLO_CONFIG,
                                     map_location=self.device)  # load FP32 model

        self.stride = int(self.detector.stride.max())  # model stride
        self.image_size = check_img_size(settings.IMAGE_SIZE, s=self.stride)  # check img_size

        if self.half:
            self.detector.half()  # to FP16

        cudnn.benchmark = True  # set True to speed up constant image size inference
        self.conf_threshold = settings.CONF_THRESHOLD
        self.iou_threshold = settings.IOU_THRESHOLD

        if self.device.type != 'cpu':
            self.detector(torch.zeros(1, 3, self.image_size, self.image_size).to(self.device).type_as(
                next(self.detector.parameters())))  # run once
        self.class_mapping = settings.CLASS_MAPPING
        self.detector.eval()

    def get_detections(self, img0):
        # Padded resize
        img = letterbox(img0, self.image_size, stride=self.stride)[0]
        img = img[:, :, ::-1].transpose(2, 0, 1)  # BGR to RGB, to 3x416x416
        img = np.ascontiguousarray(img)

        img = torch.from_numpy(img).to(self.device)
        img = img.half() if self.half else img.float()  # uint8 to fp16/32
        img /= 255.0  # 0 - 255 to 0.0 - 1.0
        if img.ndimension() == 3:
            img = img.unsqueeze(0)

        predictions = self.detector(img, augment=False)[0]
        predictions = non_max_suppression(predictions, self.conf_threshold, self.iou_threshold,
                                          classes=None, agnostic=False)

        final_detection = []
        for det in predictions:
            image_detection = []
            det[:, :4] = scale_coords(img.shape[2:], det[:, :4], img0.shape).round()
            for *xyxy, conf, cls in reversed(det):
                class_ = int(cls.item())
                x1, y1, x2, y2 = int(xyxy[0]), int(xyxy[1]), int(xyxy[2]), int(xyxy[3])
                image_detection.append([x1, y1, x2, y2, self.class_mapping[class_]])
            final_detection.append(image_detection)

        return final_detection
