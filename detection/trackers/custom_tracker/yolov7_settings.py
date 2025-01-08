# Detector
DEVICE = ""
WEIGHT_PATH = "./detection/weights/custom_tracker/yolov7_detector/yolov7_crowdhuman_best_weight.pt"
YOLO_CONFIG = "./detection/weights/custom_tracker/yolov7_detector/yolov7.yaml"
IMAGE_SIZE = 640
IOU_THRESHOLD = 0.5
CONF_THRESHOLD = 0.5
CLASS_MAPPING = {
    0: "person"
}

