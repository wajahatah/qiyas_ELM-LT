# Detector
DEVICE = ""
WEIGHT_PATH = "weights/custom_tracker/detector/updated_crowdhuman_yolov5m.pt"
YOLO_CONFIG = "trackers/custom_tracker/detector/models/yolov5m.yaml"
IMAGE_SIZE = 640
IOU_THRESHOLD = 0.5
CONF_THRESHOLD = 0.5
CLASSES_TO_CONSIDER = [1]  # possible values 0 for head and 1 body for both [0, 1]
CLASS_MAPPING = {
    0: "person",
    1: "head"
}

# Feature Extractor
#MODEL_NAME = 'osnet_x0_5'
MODEL_NAME = 'osnet_x1_0'

# MODEL_NAME = 'osnet_x0_75'

# OSNET_MODEL_PATH =None  # 'weights/custom_tracker/re_id/exp_2/model.pth.tar-70'
OSNET_MODEL_PATH ='weights/custom_tracker/re_id/exp_2/model.pth.tar-70'

# Tracking
MAX_COSINE_DISTANCE = 15.0
MAX_IOU_DISTANCE = 0.9
MAX_AGE = 60 # in seconds.
TIME_TO_INITIALIZE_TRACKS = 0 # in number of frames, basically before how many detection a track is considered as true
