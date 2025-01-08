import argparse
from detectron2.config import get_cfg
from detectron2.data.detection_utils import read_image
# from detectron2.configs import get_cfg
# from detectron2.data.detection_utils import read_image
import sys
sys.path.insert(0, 'third_party/CenterNet2/')
from detection.third_party.CenterNet2.centernet.config import add_centernet_config
from detection.detic.config import add_detic_config
from detection.detic.predictor import VisualizationDemo

from detection.vision.ssd.config.fd_config import define_img_size
from detection.vision.ssd.mb_tiny_fd import create_mb_tiny_fd, create_mb_tiny_fd_predictor
from detection.vision.ssd.mb_tiny_RFB_fd import create_Mb_Tiny_RFB_fd, create_Mb_Tiny_RFB_fd_predictor


import numpy as np
import cv2
from detection.face_detector import YoloDetector
from detection.trackers.custom_tracker.yolov7_detector.visible_person_detector import Detector
import multiprocessing as mp
import torch


class Detection():
    def __init__(self) :
            self.roi_id = []
            self.xmin = 0
            self.ymin = 0
            self.xmax = 0
            self.ymax = 0
            self.tag = None

class Base_Detector():
    def __init__(self) :
        self.detection = []
        self.face_detection = []
        self.person_detection = []
        self.head_detection = []
        self.gaze_point = []


class ObjectDetector(Base_Detector):
    def __init__(self):
        mp.set_start_method("spawn", force=True)
        # print("I am here")
        # self.args = self.get_parser().parse_args()
        # print(self.args)
        # print("I am out")
        self.cfg = self.setup_cfg()
        vocabulary = 'lvis'
        self.detic = VisualizationDemo(self.cfg,vocabulary)

        self.label_map = {
                        34 : 'bag', #handbag
                        89 : 'table', #bench
                        108 : 'black/white board', #blackboard
                        126 : 'book', #book
                        165 : 'black/white board', # bulletin board
                        229 : 'mobile phone', #cellular telephone
                        231 : 'chair', #chair
                        295 : 'keyboard', #computer keyboard
                        360 : 'table', # desk
                        630 : 'computer', #laptop_computer
                        697 : 'monitor', #computer_monitor
                        792 : 'person', #person
                        1076 : 'monitor' #television set
                        }

    def setup_cfg(self):
        cfg = get_cfg()

        config_file = 'detection/configs/Detic_LCOCOI21k_CLIP_R18_640b32_4x_ft4x_max-size.yaml'#'configs/Detic_LCOCOI21k_CLIP_SwinB_896b32_4x_ft4x_max-size.yaml' #Detic_LCOCOI21k_CLIP_SwinB_896b32_4x_ft4x_max-size
        confidence_threshold = 0.4
        opts = ['MODEL.WEIGHTS', 'models_1/Detic_LCOCOI21k_CLIP_R18_640b32_4x_ft4x_max-size.pth']#Detic_LCOCOI21k_CLIP_SwinB_896b32_4x_ft4x_max-size.pth'] # Detic_LCOCOI21k_CLIP_R18_640b32_4x_ft4x_max
        # args.pred_all_class = False
        config = 'configs/Detic_LCOCOI21k_CLIP_R18_640b32_4x_ft4x_max-size.yaml'

        # if args.cpu:
        cfg.MODEL.DEVICE="cuda"
        cfg.MODEL.MASK_ON = False
        add_centernet_config(cfg)
        add_detic_config(cfg)
        cfg.merge_from_file(config_file)
        cfg.merge_from_list(opts)
        # Set score_threshold for builtin models
        cfg.MODEL.RETINANET.SCORE_THRESH_TEST = confidence_threshold
        cfg.MODEL.ROI_HEADS.SCORE_THRESH_TEST = confidence_threshold
        # cfg.MODEL.PANOPTIC_FPN.COMBINE.INSTANCES_CONFIDENCE_THRESH = args.confidence_threshold
        cfg.MODEL.ROI_BOX_HEAD.ZEROSHOT_WEIGHT_PATH = 'rand' # load later
        # if not args.pred_all_class:
        cfg.MODEL.ROI_HEADS.ONE_CLASS_PER_PROPOSAL = True
        cfg.MODEL.MASK_ON = False
        cfg.freeze()
        return cfg

    def get_parser(self):
        parser = argparse.ArgumentParser(description="Detectron2 demo for builtin configs")
        parser.add_argument(
            "--config-file",
            default="configs/quick_schedules/mask_rcnn_R_50_FPN_inference_acc_test.yaml",
            metavar="FILE",
            help="path to config file",
        )
        parser.add_argument("--webcam", help="Take inputs from webcam.")
        # parser.add_argument("--cpu", action='store_true', help="Use CPU only.")
        parser.add_argument("--video-input", help="Path to video file.")
        parser.add_argument(
            "--input",
            nargs="+",
            help="A list of space separated input images; "
            "or a single glob pattern such as 'directory/*.jpg'",
        )
        parser.add_argument(
            "--output",
            help="A file or directory to save output visualizations. "
            "If not given, will show output in an OpenCV window.",
        )
        parser.add_argument(
            "--vocabulary",
            default="lvis",
            choices=['lvis', 'openimages', 'objects365', 'coco', 'custom'],
            help="",
        )
        parser.add_argument(
            "--custom_vocabulary",
            default="",
            help="",
        )
        parser.add_argument("--pred_all_class", action='store_true')
        parser.add_argument(
            "--confidence-threshold",
            type=float,
            default=0.5,
            help="Minimum score for instance predictions to be shown",
        )
        parser.add_argument(
            "--opts",
            help="Modify config options using the command-line 'KEY VALUE' pairs",
            default=[],
            nargs=argparse.REMAINDER,
        )

        parser.add_argument("--device", default="gpu", help="Device to inference on")
        parser.add_argument("--image_file", default="group.jpg", help="Input image")
        return parser
    

    def detic_detection(self,frame) :

        image_pose = frame#[ymin_offset:1100,xmin_offset:2100]

        base_detector = Base_Detector()

        predictions, visualized_output = self.detic.run_on_image(image_pose)

        instances = predictions["instances"].to(torch.device("cpu"))

        classes = instances.pred_classes.tolist() if instances.has("pred_classes") else None

        boxes = instances.pred_boxes#.tolist() if instances.has("pred_boxes") else None


        classes_new = []
        scores_new = []
        boxes_new = []

        for i in range(len(classes)):
            if classes[i] ==34 or classes[i] == 89 or classes[i] == 108 or classes[i] ==126 or classes[i] == 165 or classes[i] == 229 or classes[i] == 231 or classes[i] == 295 or classes[i] == 360 or classes[i] == 630 or classes[i] == 697 or classes[i] ==792 or classes[i] == 1076  : 
            

                box_tensor = instances.pred_boxes[i].tensor

                x1 = int(box_tensor[0, 0].int().item())
                y1 = int(box_tensor[0, 1].int().item())
                x2 = int(box_tensor[0, 2].int().item())
                y2 = int(box_tensor[0, 3].int().item())
            
                width = x2 - x1
                height = y2 - y1

                # Calculate padding (20% of width and height)
                padding_w = int(width * 0.2)
                padding_h = int(height * 0.2)

                # Expand coordinates
                new_x1 = x1 - padding_w
                new_y1 = y1 - padding_h
                new_x2 = x2 + padding_w
                new_y2 = y2 + padding_h

       
                scores_new.append(instances.scores[i])
                # boxes_new.append([x1,y1,x2,y2])
                boxes_new.append([new_x1,new_y1,new_x2,new_y2])
                label_val = self.label_map.get(classes[i])
                classes_new.append(label_val)


        for i in range(len(boxes_new)) :

            if classes_new[i] == 'person' : # person class
                base_detector.person_detection.append([boxes_new[i],'person'])

            else : 
                base_detector.detection.append((boxes_new[i],classes_new[i]))


        # return base_detector.person_detection, base_detector.detection
        return base_detector.detection



define_img_size(128)
class FaceDetector(Base_Detector):
    def __init__(self):

        self.label_path = "./models/voc-model-labels.txt"
        self.net_type = 'slim'
        self.class_names = [name.strip() for name in open(self.label_path).readlines()]
        self.num_classes = len(self.class_names)
        self.test_device = "cuda:0"
        self.candidate_size = 1500
        self.threshold = 0.3

        if self.net_type == 'slim':
            # model_path = "models/pretrained/version-slim-320.pth"
            model_path = "models/pretrained/version-slim-640.pth"
            self.net = create_mb_tiny_fd(len(self.class_names), is_test=True, device=self.test_device)
            self.predictor = create_mb_tiny_fd_predictor(self.net, candidate_size=self.candidate_size, device=self.test_device)
        elif self.net_type == 'RFB':
            # model_path = "models/pretrained/version-RFB-320.pth"
            model_path = "models/pretrained/version-RFB-640.pth"
            self.net = create_Mb_Tiny_RFB_fd(len(self.class_names), is_test=True, device=self.test_device)
            self.predictor = create_Mb_Tiny_RFB_fd_predictor(self.net, candidate_size=self.candidate_size, device=self.test_device)
        else:
            print("The net type is wrong!")
            sys.exit(1)
        self.net.load(model_path)

    def face_detection(self,frame, base_detector) :
        

        for item in base_detector.person_detection:

            x_min = int(item[0])
            y_min = int(item[1])
            x_max = int(item[2])
            y_max = int(item[3])

            person_crop = frame[y_min:int(y_min+((y_max-y_min)/2)), x_min:x_max]
            
            process_image = cv2.cvtColor(person_crop, cv2.COLOR_BGR2RGB)

            boxes, labels, probs = self.predictor.predict(process_image, self.candidate_size / 2, self.threshold)

            for i in range(boxes.size(0)):
                box = boxes[i, :]
                box = box.numpy()
                coords = box[:].astype(np.int32)

                mean_x = int((box[0] + box[2])/2)
                mean_y = int((box[1]+box[3])/2)

                coords[0] = box[0] - (0.7 *(box[2] - box[0]))
                coords[1] = box[1] - (0.4 * (box[3] - box[1]))
                coords[2] = box[2] - box[0] + (1.4 *(box[2] - box[0]))
                coords[3] = box[3] - box[1] + (0.5 * (box[3] - box[1]))

                # do NMS
                overlap = False
                if len(base_detector.face_detection) > 0 :
                    for det in base_detector.face_detection :
                        mean_membox = (det[0]+ det[1])/2
                        mean_curbox = ((x_min+coords[0]) + (y_min+coords[1]) )/2

                        if np.abs(mean_membox - mean_curbox) < 60 :
                            overlap = True 
                    if overlap != True :
                        base_detector.face_detection.append((x_min+coords[0], y_min+coords[1], coords[2], coords[3]))
                else :
                    base_detector.face_detection.append((x_min+coords[0], y_min+coords[1], coords[2], coords[3]))

        return base_detector



class YoloV7PersonDetector:
    def __init__(self, frame_rate = 30, img_size=(1088, 608)):
        self.detector = Detector()

    def get_bbox(self, frame):
        """

        :param frame:
        :return: tracks 2d array with values in following format
                '[[-1,{id},{x1},{y1},{w},{h},1,-1,-1,-1]]'
        """
        detections = self.detector.get_detections(frame)[0]

        return np.array(detections)


class YoloFaceDetector(Base_Detector):
    def __init__(self):

        self.model = YoloDetector(weights_name='yolov5l_state_dict.pt', target_size=720, min_face=2)

    def face_detection(self,frame, person_detection) :

        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        base_detector = Base_Detector()

        x_min_list = []
        y_min_list = []
        x_max_list = []
        y_max_list = []
        person_crop_list = []
        roi_id_list = []


        for item in person_detection:

            if item.tag == 'student' :
                x_min_p = int(item.xmin)
                y_min_p = int(item.ymin)
                x_max_p = int(item.xmax)
                y_max_p = int(item.ymax)



                x_min_list.append(x_min_p)
                y_min_list.append(y_min_p)
                roi_id_list.append(item.roi_id)
                x_max_list.append(x_max_p)
                y_max_list.append(y_min_p+((y_max_p-y_min_p)/2))

                person_crop = frame[y_min_p:int(y_min_p+((y_max_p-y_min_p)/2)), x_min_p:x_max_p]

                person_crop = cv2.resize(person_crop,(128,128))

                person_crop_list.append(person_crop)


        bboxes, points = self.model.predict(person_crop_list)

        index = 0
        if len(bboxes) > 0:
            counter = 0
            for box in bboxes:
                if len(box) > 1: #multiple faces detected inside a cropped person image
                    box = box [0]
                if len(box) == 0:
                    counter+=1
                    continue

                if len(box) == 4:
                    box = box   
                else:
                    box = box[0]

                box[0] = (box[0]/128) * (x_max_list[counter] - x_min_list[counter])
                box[1] = (box[1]/128) * (y_max_list[counter] - y_min_list[counter])
                box[2] = (box[2]/128) * (x_max_list[counter] - x_min_list[counter])
                box[3] = (box[3]/128) * (y_max_list[counter] - y_min_list[counter])


                x = box[0] #- (0.5 *((box[2] - box[0])/128 * (x_max_list[counter] - x_min_list[counter])))
                y = box[1] #- (0.2 * ((box[3] - box[1])/224 * (y_max_list[counter] - y_min_list[counter])))
                x_max = box[2]# + (0.5 *((box[2] - box[0])/128 * (x_max_list[counter] - x_min_list[counter])))
                y_max = box[3]# - (0.2 * ((box[3] - box[1])/224 * (y_max_list[counter] - y_min_list[counter])))
                # width = box[2] - box[0] + (1.4 *(box[2] - box[0]))
                # height = box[3] - box[1] + (1.2 * (box[3] - box[1]))

                xmin_new = x - (0.5 *(x_max-x))
                xmax_new = x_max + (1.0 *(x_max-x))

                ymin_new = y - (0.1 *(y_max-y))
                ymax_new = y_max + (0.1 *(y_max-y))


                base_detector.face_detection.append(Detection())
                base_detector.face_detection[index].roi_id = roi_id_list[counter]
                base_detector.face_detection[index].xmin = x_min_list[counter] + xmin_new
                base_detector.face_detection[index].ymin = y_min_list[counter] + ymin_new
                base_detector.face_detection[index].xmax = x_min_list[counter] + xmax_new
                base_detector.face_detection[index].ymax = y_min_list[counter] + ymax_new
                index+=1

                counter+=1

        return base_detector.face_detection


class YoloHeadDetector(Base_Detector):
    def __init__(self):

        self.model_head = YoloDetector(weights_name='yolov5l_state_dict.pt', config_name='yolov5l.yaml', target_size=720, min_face=2)

    def head_detection(self,frame) :

        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        base_detector = Base_Detector()

        x_min_list = []
        y_min_list = []
        x_max_list = []
        y_max_list = []
        person_crop_list = []
        roi_id_list = []


        # for item in person_detection:

        #     if item.tag == 'student' :
        #         x_min_p = int(item.xmin)
        #         y_min_p = int(item.ymin)
        #         x_max_p = int(item.xmax)
        #         y_max_p = int(item.ymax)



        #         x_min_list.append(x_min_p)
        #         y_min_list.append(y_min_p)
        #         roi_id_list.append(item.roi_id)
        #         x_max_list.append(x_max_p)
        #         y_max_list.append(y_min_p+((y_max_p-y_min_p)/2))

        #         person_crop = frame[y_min_p:int(y_min_p+((y_max_p-y_min_p)/2)), x_min_p:x_max_p]

        #         person_crop = cv2.resize(person_crop,(128,128))

        #         person_crop_list.append(person_crop)


        bboxes, points = self.model_head.predict(frame)

        index = 0
        if len(bboxes) > 0:
            counter = 0
            for box in bboxes:
                if len(box) > 1: #multiple faces detected inside a cropped person image
                    box = box [0]
                if len(box) == 0:
                    counter+=1
                    continue

                if len(box) == 4:
                    box = box   
                else:
                    box = box[0]

                box[0] = (box[0]/128) * (x_max_list[counter] - x_min_list[counter])
                box[1] = (box[1]/128) * (y_max_list[counter] - y_min_list[counter])
                box[2] = (box[2]/128) * (x_max_list[counter] - x_min_list[counter])
                box[3] = (box[3]/128) * (y_max_list[counter] - y_min_list[counter])


                x = box[0] #- (0.5 *((box[2] - box[0])/128 * (x_max_list[counter] - x_min_list[counter])))
                y = box[1] #- (0.2 * ((box[3] - box[1])/224 * (y_max_list[counter] - y_min_list[counter])))
                x_max = box[2]# + (0.5 *((box[2] - box[0])/128 * (x_max_list[counter] - x_min_list[counter])))
                y_max = box[3]# - (0.2 * ((box[3] - box[1])/224 * (y_max_list[counter] - y_min_list[counter])))
                # width = box[2] - box[0] + (1.4 *(box[2] - box[0]))
                # height = box[3] - box[1] + (1.2 * (box[3] - box[1]))

                xmin_new = x - (0.5 *(x_max-x))
                xmax_new = x_max + (1.0 *(x_max-x))

                ymin_new = y - (0.1 *(y_max-y))
                ymax_new = y_max + (0.1 *(y_max-y))


                base_detector.head_detection.append(Detection())
                base_detector.head_detection[index].roi_id = roi_id_list[counter]
                base_detector.head_detection[index].xmin = x_min_list[counter] + xmin_new
                base_detector.head_detection[index].ymin = y_min_list[counter] + ymin_new
                base_detector.head_detection[index].xmax = x_min_list[counter] + xmax_new
                base_detector.head_detection[index].ymax = y_min_list[counter] + ymax_new
                index+=1

                counter+=1

        return base_detector.head_detection

