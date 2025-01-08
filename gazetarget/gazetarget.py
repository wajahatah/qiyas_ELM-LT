import torch
import numpy as np
from PIL import Image
from torchvision import transforms
from gazetarget.models.chong import ModelSpatial#,ModelSpatioTemporal
from gazetarget.dataloader import chong_imutils as imutils
from detection.detector import Base_Detector
from gazetarget.config import *
from gazetarget.models.__init__ import save_checkpoint, resume_checkpoint
import re
import math
# import constants

class GazeDetection():
    def __init__(self) :
            self.roi_id = []
            self.gaze_x = 0
            self.gaze_y = 0
            self.head_x = 0
            self.head_y = 0
            self.angle = - 100 # we expect in range 0-360


class GazeTarget(Base_Detector):

    def __init__(self):
        self.model_elm = ModelSpatial()
        self.model_dict = self.model_elm.state_dict()

        self.pretrained_dict = torch.load("./models_1/model_gazefollow.pt") #model_gazefollow
        self.pretrained_dict = self.pretrained_dict['model']
        self.model_dict.update(self.pretrained_dict)

        self.model_elm.load_state_dict(self.model_dict)
        self.model_elm.cuda()
        self.model_elm.train(False)

        
        self.model_elm, optimizer_elm, start_epoch_elm = resume_checkpoint(self.model_elm, None, "models_1/model_epoch421_20240804012203.pth.tar")
        self.model_elm.eval()

        
        
        self.test_transforms = self._get_transform()




    def _get_transform(self):
        transform_list = []
        transform_list.append(transforms.Resize((224, 224)))
        transform_list.append(transforms.ToTensor())
        transform_list.append(transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]))
        return transforms.Compose(transform_list)
    


    def extract_probabilities(self, action_list):
        probabilities = {}
        for action in action_list:
            match = re.match(r'\[(0\.\d+)\] (.+)', action)
            if match:
                prob = float(match.group(1))
                action_name = match.group(2)
                probabilities[action_name] = prob
        return probabilities


    def get_angle(self, x1, y1, x2, y2):
        """
        Calculates the angle of the line formed by points (x1, y1) and (x2, y2)
        relative to a vertical line.

        Args:
            x1: x-coordinate of the first point.
            y1: y-coordinate of the first point.
            x2: x-coordinate of the second point.
            y2: y-coordinate of the second point.

        Returns:
            The angle in degrees (0 to 360).
        """

        # Avoid division by zero (vertical line case)
        if x1 == x2:
            return 0  # Line coincides with vertical line, angle is 0

        # Calculate slope
        m = (y2 - y1) / (x2 - x1)

        # Calculate complementary angle using arctangent
        # angle_rad = math.atan(m) + math.pi / 2  # Convert to radians first
        angle_rad = np.arctan2([y2 - y1], [x2- x1]) * (180 / np.pi)

        angle_rad += 90

        # Convert radians to degrees
        # angle_deg = math.degrees(angle_rad)
        # print('Angle in gazetarget', angle_rad)
        # Adjust angle based on quadrant
        # if x1 < x2 and y2 < y1:  # Line slants downwards to the right (2nd or 3rd quadrant)
        #     angle_deg += 180

        # Ensure angle is between 0 and 360 degrees
        # angle_deg = angle_deg % 360

        return angle_rad

    def predict_gaze_target(self,head_detection, frame_raw): #, actions):

        # filtered_heads = []
        # filtered_actions = []
        
        # for head, action_list in zip(head_detection, actions):
        #     if action_list == 'No action':
        #         continue
            
        #     action_probabilities = self.extract_probabilities(action_list)
        #     if action_probabilities:
        #         sitting_prob = action_probabilities.get('sitting', 0)
        #         mouse_keyboard_prob = action_probabilities.get('use mouse/keyboard', 0)
                
        #         if sitting_prob > constants.gaze_invoking_threshold_on_action or mouse_keyboard_prob > constants.gaze_invoking_threshold_on_action:
        #         # if mouse_keyboard_prob > 0.5:
        #             filtered_heads.append(head)
        #             filtered_actions.append(action_list)
        
        # head_detection = filtered_heads

        #filtered_actions = actions

        
        gaze_target_list = []
        complete_head_list = []

        
        base_detector = Base_Detector()

        head_list = []
        headchannel_list = []
        frame_list = []

        # head_detection = head_detection.cpu()
        # head_detection = head_detection.numpy()

        for i in range(len(head_detection)):
            coords = [None] * 4
            # coords[0] = np.maximum(0,int(head_detection[i].xmin))#mean_x - 25
            # coords[1] = np.maximum(0,int(head_detection[i].ymin))#mean_y - 25
            # coords[2] = np.minimum(frame_raw.shape[1]-1,int(head_detection[i].xmax))#50
            # coords[3] = np.maximum(frame_raw.shape[0]-1,int(head_detection[i].ymax))#50

            #to adjust incoming data from head detection model
            coords[0] = int(head_detection[i][0]) #np.maximum(0,int(head_detection[i].xmin))#mean_x - 25
            coords[1] = int(head_detection[i][1]) #np.maximum(0,int(head_detection[i].ymin))#mean_y - 25
            coords[2] = int(head_detection[i][2]) #np.minimum(frame_raw.shape[1]-1,int(head_detection[i].xmax))#50
            coords[3] = int(head_detection[i][3]) #np.maximum(frame_raw.shape[0]-1,int(head_detection[i].ymax))#50


            head = frame_raw[coords[1]:coords[3], coords[0]:coords[2]] # head crop
            #print("Head in gazetarget: " + str(head))
            # t1 = time.time()
            head = Image.fromarray(head)


            frame_raw2 = Image.fromarray(frame_raw)
            frame_raw2 = frame_raw2.convert('RGB')
            width, height = frame_raw2.size

            # t1 = time.time()
            head = self.test_transforms(head) # transform inputs
            frame = self.test_transforms(frame_raw2)
            
            # t1 = time.time()
            head_channel = imutils.get_head_box_channel(coords[0],coords[1], coords[2], coords[3], width, height,
                                                        resolution=224, coordconv=False).unsqueeze(0)

            # print("detection time 3", time.time()-t1)
            head_list.append(head)
            headchannel_list.append(head_channel)
            frame_list.append(frame)
        
        # complete_head_list.append(head_detection.tolist())
        complete_head_list.append(head_detection)

        if len(head_list) > 0 :
            
            head_list = torch.stack(head_list)
            frame_list = torch.stack(frame_list)
            headchannel_list = torch.stack(headchannel_list)

            head_list = head_list.cuda()
            frame_list = frame_list.cuda()
            headchannel_list = headchannel_list.cuda()

            predict_heatmap = self.model_elm(frame_list, headchannel_list, head_list)
            
            out_size = 64
            GP = []
            #print("Head bboxes: " + str(head_detection))
            for heatmap in predict_heatmap :
                heatmap = heatmap.cpu().data.numpy()
                heatmap = heatmap[0].reshape([out_size, out_size])

                h_index, w_index = np.unravel_index(heatmap.argmax(), heatmap.shape)
                f_point = np.array([w_index / out_size, h_index / out_size])

                gaze_point = f_point

                x2, y2 = gaze_point

                
                x1, y1 = int((int(head_detection[len(GP)][0])+int(head_detection[len(GP)][2]))/2), int((int(head_detection[len(GP)][1])+int(head_detection[len(GP)][3]))/2)
                image_height, image_width = frame_raw.shape[:2]

                x2, y2 = image_width * x2, y2 * image_height

                x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])

                angle = self.get_angle(x1, y1, x2, y2)

                line_length = math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

                gaze_point =  x2, y2

                #print("Gaze Point: " + str(gaze_point))
                GP.append(gaze_point)

                base_detector.gaze_point.append(GazeDetection())
                #base_detector.gaze_point[len(base_detector.gaze_point)-1].roi_id = head_detection[len(base_detector.gaze_point)-1].roi_id
                base_detector.gaze_point[len(base_detector.gaze_point)-1].roi_id = 3
                base_detector.gaze_point[len(base_detector.gaze_point)-1].gaze_x = x2
                base_detector.gaze_point[len(base_detector.gaze_point)-1].gaze_y = y2
                base_detector.gaze_point[len(base_detector.gaze_point)-1].head_x = x1
                base_detector.gaze_point[len(base_detector.gaze_point)-1].head_y = y1
                base_detector.gaze_point[len(base_detector.gaze_point)-1].angle = angle
                base_detector.gaze_point[len(base_detector.gaze_point)-1].line_length = line_length

            gaze_target_list.append(GP) 
            
        # gaze_target_json = json.dumps(gaze_target_list)
        # head_json = json.dumps(complete_head_list)
        # print('Filtered heads:')
        # print(filtered_heads)
            
        return base_detector.gaze_point#, filtered_actions#, gaze_target_json, head_json
