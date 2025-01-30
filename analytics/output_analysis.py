from collections import deque
import numpy as np
from datetime import datetime
import re
import math
import constants
import cv2
# from analytics.test_binary_classifier import Gaze_Inference
from poseyolo import ypose
import time
from matplotlib.path import Path

buffer_size = constants.action_window_buffer_size
action_buffer = deque(maxlen=buffer_size)
# looking_around_model = Gaze_Inference()
looking_around_model2 = ypose()

## Estimating sitting order of the candidates
def candidate_number_head(head, desk_bbox):
    keys = list(desk_bbox.keys())
    candidate_num = 0
    center_point = ((head[0]+head[2])/2,(head[1]+head[3])/2)
    for dsk in keys :
        if desk_bbox[dsk]['xmax'] >= center_point[0] >= desk_bbox[dsk]['xmin'] and desk_bbox[dsk]['ymax'] >= center_point[1] >= desk_bbox[dsk]['ymin']:
            candidate_num = int(dsk) 

    if candidate_num > 0:
        return candidate_num
    else:
        return print("No Candidate found in selected ROI")


"""
## Estimating sitting order of the candidates using gaze point
def candidate_number(gaze_point, desk_bbox):
    keys = []
    for key in desk_bbox.keys() :
        keys.append(key)
    candidate_num = 0
    for dsk in keys :
        if desk_bbox[dsk]['xmax'] >= gaze_point.head_x >= desk_bbox[dsk]['xmin'] and desk_bbox[dsk]['ymax'] >= gaze_point.head_y >= desk_bbox[dsk]['ymin']:
            candidate_num = int(dsk) 

    if candidate_num > 0:
        return candidate_num
    else:
        return print("No Candidate found in selected ROI")
"""

## Estimating if gaze point lies inside the bbox of objects 
def gaze_in_bbox(gaze_point, bbox):
            return gaze_point.gaze_x > bbox[0] and gaze_point.gaze_x < bbox[2] and gaze_point.gaze_y > bbox[1] and gaze_point.gaze_y < bbox[3]

## Estimating attention score of individual candidate
def individual_Attention_score(user):
    good_act = user['keyboard'] + user['monitor'] + user['computer'] + user['mobile phone']
    bad_act = user['Other']
    IAS = round((good_act / (good_act + bad_act)) * 100, 2)
    return IAS

def remove_numbers(item):
    if isinstance(item, list):
        return [re.sub(r'\[\d+\.\d+\]', '', elem).strip() for elem in item]
    elif isinstance(item, str):
        return re.sub(r'\[\d+\.\d+\]', '', item).strip()
    return item

def calculate_iou(box, roi):
    # Calculate intersection
    ixmin = max(box[0], roi["xmin"])
    iymin = max(box[1], roi["ymin"])
    ixmax = min(box[2], roi["xmax"])
    iymax = min(box[3], roi["ymax"])
    iw = max(ixmax - ixmin + 1, 0)
    ih = max(iymax - iymin + 1, 0)
    intersection = iw * ih

    # Calculate union
    box_area = (box[2] - box[0] + 1) * (box[3] - box[1] + 1)
    roi_area = (roi["xmax"] - roi["xmin"] + 1) * (roi["ymax"] - roi["ymin"] + 1)
    union = box_area + roi_area - intersection

    # IoU
    iou = intersection / union
    return iou

def calculate_area(box):
    """Calculates the area of a bounding box."""
    x_min, y_min, x_max, y_max = box
    return max(0, x_max - x_min) * max(0, y_max - y_min)

def calculate_intersection_area(box1, box2):
    """Calculates the intersection area between two bounding boxes."""
    x_min1, y_min1, x_max1, y_max1 = box1
    x_min2, y_min2, x_max2, y_max2 = box2

    # Find overlap coordinates
    x_min_inter = max(x_min1, x_min2)
    y_min_inter = max(y_min1, y_min2)
    x_max_inter = min(x_max1, x_max2)
    y_max_inter = min(y_max1, y_max2)

    # Calculate intersection area
    return calculate_area((x_min_inter, y_min_inter, x_max_inter, y_max_inter))


def calculate_percentage_coverage(ground_truth_box, predicted_box):
    """Calculates the percentage of the ground truth box area covered by the predicted box."""
    intersection_area = calculate_intersection_area(ground_truth_box, predicted_box)
    ground_truth_area = calculate_area(ground_truth_box)

    # Calculate percentage coverage
    if ground_truth_area == 0:
        return 0  # Avoid division by zero
    return (intersection_area / ground_truth_area) * 100


def find_roi_with_max_iou(bboxes, rois, stand_head):
    ##### Old IOU Logic
    # results = []  
    # for bbox in bboxes:
    #     max_iou = 0
    #     best_roi = None
    #     for region_id, roi in rois.items():
    #         iou = calculate_iou(bbox, roi)
    #         # print("box :",bbox)
           
    #         # overlap = calculate_percentage_coverage(,(roi['xmin'],roi['ymin'],roi['xmax'],roi['ymax']))
    #         # if overlap > 20:
    #         #     print("****\nregion ID",region_id)
    #         #     print("Overlap",overlap,"\n*****")
    #         if iou > max_iou:
    #             max_iou = iou
    #             best_roi = (region_id, iou)
    #     if best_roi:
    #         results.append(best_roi[0])
    ##### End of old IOU Logic
    overling= []
    for s_head in stand_head:
        for region_id, roi in rois.items():
            overlap = calculate_percentage_coverage((s_head[0],s_head[1],s_head[2],s_head[3]),(roi['xmin'],roi['ymin'],roi['xmax'],roi['ymax']))
            if overlap > constants.overlap_threshold:
                overling.append(region_id)
    return overling


def visual_region(center_point, th_angle):
    length = 150  # Length of the lines

    # Convert degrees to radians
    angle_rad = th_angle*(3.142/180)

    # Calculate the endpoint for the 30-degree line
    left_end_point_1 = (
        int(center_point[0] - (length * math.sin(angle_rad))),
        int(center_point[1] - length * math.cos(angle_rad))
    )

    # Calculate the endpoint for the -30-degree line
    right_end_point_2 = (
        int(center_point[0] + (length * math.sin(angle_rad))),
        int(center_point[1] - (length * math.cos(angle_rad)))
    )

    return left_end_point_1, right_end_point_2

def get_angle(x1, y1, x2, y2):
        # Avoid division by zero (vertical line case)
        if x1 == x2:
            return 0  # Line coincides with vertical line, angle is 0

        # Calculate slope
        m = (y2 - y1) / (x2 - x1)

        # Calculate complementary angle using arctangent
        angle_rad = np.arctan2([y2 - y1], [x2- x1]) * (180 / np.pi)

        # angle_rad += 90

        return angle_rad

import math

def draw_angle_line(frame, center, angle, length=100):
    # Convert angle to radians for trigonometric functions
    # angle_rad = math.radians(90) + math.radians(angle)
    angle_rad =  math.radians(angle)
    # print("line")
    # Calculate endpoint based on angle and length
    end_x = int(center[0] + length * math.cos(angle_rad))
    end_y = int(center[1] - length * math.sin(angle_rad))  # Subtract because y-axis is inverted in images
    # print("end",end_x,end_y)
    # Draw the line
    return cv2.line(frame, center, (end_x, end_y), (0, 255, 0), 4)

def create_polygon(*points):
    # Convert points to a list and ensure the polygon is closed
    polygon = list(points) + [points[0]]
    return Path(polygon)


# def analytical_computation(candidate_score, action_model_output, gaze_point, object_detection, desk_roi, initial_appends, before, hand_flag, stand_flag, heads, stand_bbox, frame, config_dict, raw_frame,stand_head):
def analytical_computation(candidate_score, desk_roi, initial_appends, before, hand_flag, heads, heads_dict, stand_bbox, frame, config_dict, raw_frame,stand_head,pose_data, in_angle,ex_angle):
      
    frame_visual_area = frame  
    cand_curr_info = {1: {'Other' : 0,
                          'Att_Score' : 0},
                      2: {'Other' : 0,
                          'Att_Score' : 0},
                      3: {'Other' : 0,
                          'Att_Score' : 0},
                      4: {'Other' : 0,
                          'Att_Score' : 0}}

    candidate_order = []
    head_candidate_mapping = {}

    alert_notification = []
    action_final = []

    actions_classes = ['raising hand', 'using mobile phone', 'student interacting with invigilator']
    action_matrix = [[0 for _ in range(4)] for _ in range(4)]

    action_anomaly_precedence_dict = constants.action_anomaly_precedence_dict
    action_precedence = list(action_anomaly_precedence_dict.values())
    action_precedence_names = list(action_anomaly_precedence_dict.keys())


    absent_candidates = {
    'card_resetting': {
        1: False,
        2: False,
        3: False,
        4: False }}
    
    # print("heads:")
    
    for gz in range(len(heads)):
        candidate_num = candidate_number_head(heads[gz], desk_roi)
        
    # for key, value in heads.items():
    #     candidate_num = candidate_number_head(value, desk_roi)
        if candidate_num is None:
            continue  # if no head in any of the ROI then skip all computation
        
        if candidate_num not in candidate_order:
            candidate_order.append(candidate_num)
            head_candidate_mapping[candidate_num] = gz

    # candidate_bool["Score"] = score
    current_time = datetime.now().time()
    formatted_time = current_time.strftime('%H:%M:%S')

    # candidate_bool["Time"] = formatted_time
    cand_curr_info["Time"] = formatted_time

    # Initialize a new list of 4 elements with empty strings
    candidate_action = [''] * 4

    # adding abscent in place where no candidate found remove probability values from the begining of the text
    processed_action = ['absent' if not elem else remove_numbers(elem) for elem in candidate_action]
    
    looking_around_list = [0,0,0,0]

    while len(candidate_order) < len(hand_flag):
        candidate_order.append(0)
    hand_flag = np.array(hand_flag) * np.array(candidate_order)
    hand_flag = hand_flag.tolist()
    # desk_angle = 
    # allowed_angle = 60
    for key in pose_data:
            a,b = int(pose_data[key]['Ax']), int(pose_data[key]['Ay'])
            e,d = int(pose_data[key]['Bx']), int(pose_data[key]['By'])
            hx,hy = int(pose_data[key]['Cx']), int(pose_data[key]['Cy'])
            cv2.circle(frame, (a,b), 2, (0, 255, 0), 3) 
            cv2.circle(frame, (e,d), 2, (0, 255, 0), 3) 
            cv2.circle(frame, (hx,hy), 2, (0, 255, 0), 3) 
            # print("a,b,e,d",a,b,e,d)
            left_point = desk_roi[str(key)]['left_x'], desk_roi[str(key)]['left_y']
            right_point = desk_roi[str(key)]['right_x'], desk_roi[str(key)]['right_y']
            cv2.line(frame, left_point, right_point, (0, 255, 0), 1)
            print("a",a,"b",b,"e",e,"d",d)
            print("=====================================")
            
            """
            # cv2.putText(frame, str(angle), (int((a+e)/2) - 10, int((b+d)/2 - 10)),cv2.FONT_HERSHEY_SIMPLEX, 1,(0,0,255),2)
            # Polygon logic
            ### start
            # cv2.line(frame, (a,b), (e,d), (0, 255, 0), 2)
            # rad_angle = math.radians(90)
            # print('key:',key)

            # center = (int((a+e)/2), int((b+d)/2))
            # # gaze = (center[0]+10,center[1]+10)
            # end_x = int(center[0] + 10 * math.cos(rad_angle))
            # end_y = int(center[1] - 10 * math.sin(rad_angle))
            # gaze = (end_x,end_y)
            # xmin = desk_roi[str(key)]['xmin']
            # ymin = desk_roi[str(key)]['ymin']
            # xmax = desk_roi[str(key)]['xmax']
            # top_left = (xmin, ymin)
            # top_right = (xmax, ymin)

            # print("left_point",left_point)
            # pri
            # nt("right_point",right_point)
            # polygon = create_polygon(top_right, top_left, left_point, center, right_point )

            # points = np.array([top_right, top_left, left_point, center, right_point], np.int32)
            # # points = points.reshape((-1, 1, 2))
            # cv2.polylines(frame, [points], isClosed=True, color=(0, 255, 0), thickness=2)
            # cv2.line(frame, center, gaze, (255, 0, 0), 3)
            # cv2.circle(frame, gaze, 5, (0, 0, 255), -1)

            # if polygon.contains_point(gaze):
            #     looking_around_list[int(key)-1] = 0
            # else:
            #     looking_around_list[int(key)-1] = 1
            #     cv2.putText(frame, "looking around", center,cv2.FONT_HERSHEY_SIMPLEX, 1,(255,55,158),2)
            ### end
"""
            # center angle logic 
            ### start
            # if (a and b) and (e and d) and (hx and hy) > 0:
            # if a and e > 0:
            if b and d > 0:
                angle = get_angle(a,b,e,d)
                cv2.line(frame, (a,b), (e, d), (0, 255, 0), 4)
                diff = (desk_roi[str(key)]['ymax'] - desk_roi[str(key)]['ymin']) / 2

                if d and b < left_point[1] or d and b < right_point[1]:
                    allowed_angle = ex_angle

                else:
                    allowed_angle = in_angle

                LA_angle_threshold = allowed_angle - int(((d+b)/2 - diff) / (desk_roi[str(key)]['ymax'] - diff) * 30)
                
                if abs(angle) < LA_angle_threshold:
                    looking_around_list[int(key)-1] = 0

                elif abs(angle) > LA_angle_threshold:
                    looking_around_list[int(key)-1] = 1
                    print("looking around")
                    cv2.putText(frame, "looking around", (int((a+e)/2), int((b+d)/2)),cv2.FONT_HERSHEY_SIMPLEX,0.8,(0,255,8),2)

                if config_dict.get('visual_field_drawing'):
                    center = (int((a+e)/2), int((b+d)/2))
                    # cx = center[0]
                    # cy = center[1]

                    cv2.putText(frame, str(center), (int((a+e)/2), int((b+d)/2)),cv2.FONT_HERSHEY_SIMPLEX,0.8,(0,255,8),2)
                    cv2.circle(frame, center, 5, (0, 0, 255), -1)
                    left_point, right_point = visual_region(center, LA_angle_threshold)
                    # frame_visual_area = cv2.line(frame, center, (center[0],center[1]-50), (255, 255, 255), 4)
                    # frame_visual_area = draw_angle_line(frame, center, LA_angle_threshold)
                    frame_visual_area = cv2.line(frame, center, left_point, (255, 255, 255), 4)
                    frame_visual_area = cv2.line(frame, center, right_point, (255, 255, 255), 4) 


    ## Iterate over the persons_actions list and fill in the action_matrix (4X4) where rows represent students and column represent actions
    for i, person in enumerate(processed_action):
        if person != 'absent' and person != 'No action':
            for action in person:
                if action in actions_classes:
                    action_index = actions_classes.index(action)
                    action_matrix[i][action_index] = 1

    # Incorporate the looking_around_list into the action_matrix at 4th column 
    for i, looking_around in enumerate(looking_around_list):
        action_matrix[i][3] = looking_around

    Stand_max_iou_roi = find_roi_with_max_iou(stand_bbox, desk_roi,stand_head)
    ## overwriting YowoV2 output with Yolov5 output for hand raise.
    for k in range (len(action_matrix)):
        if k+1 in hand_flag:
            action_matrix[k][actions_classes.index('raising hand')] = 1
        else:
            action_matrix[k][actions_classes.index('raising hand')] = 0

    ## overwriting YowoV2 output with roi based output for student inteacting with invigilator.
    for k in range (len(action_matrix)):
        if str(k + 1) in Stand_max_iou_roi and (k+1) in candidate_order:
            action_matrix[k][actions_classes.index('student interacting with invigilator')] = 1
        else:
            action_matrix[k][actions_classes.index('student interacting with invigilator')] = 0
    
    ## To fill the buffer until it reaches its max limit
    if initial_appends:
        action_buffer.append(action_matrix)
        if len(action_buffer) == buffer_size:
            initial_appends = False

    ## As the buffer reaches its limit, its computation started with sliding window     
    else:
        # Calculating the average of the actions in buffer for each candidate
        avg_action = np.mean(action_buffer, axis=0)
        
        # Identify actions where the average exceeds 0.8 for each person
        exceeds_threshold = (avg_action > constants.avg_action_threshold).astype(int)

        ## checking if the average of actions in buffer exist in the present new frame
        current_comparison = (exceeds_threshold & action_matrix).astype(int)
        current_comparison = current_comparison.tolist()
        
        #updating current comparison with strings based on precedence of actions if there were two or more actions found for same person.
        comparison_updated = []
        for hi,c in enumerate(current_comparison):

            c2 = sum(np.multiply(c, action_precedence))
            if c2 == 0:
                comparison_updated.append('Normal')

            elif c2 >= 8:
                comparison_updated.append(action_precedence_names[action_precedence.index(8)])

            elif c2 >= 4: # only hand raise if the yolov5 model for hand raise detection confirms its presence.
                comparison_updated.append(action_precedence_names[action_precedence.index(4)])

            elif c2 >= 2:
                comparison_updated.append(action_precedence_names[action_precedence.index(2)])
            else:
                comparison_updated.append(action_precedence_names[action_precedence.index(1)])

        for index, (bef, curr) in enumerate(zip(before, comparison_updated)):
            if bef == curr:
                action_final.append(curr)
            elif curr == "Normal":
                action_final.append(curr)
            else:
                alert_notification.append({index+1:{"id":datetime.now().strftime("%Y-%m-%d %H:%M:%S"),"alert_title":curr}})
                action_final.append(curr)
        
        before = action_final
        action_buffer.append(action_matrix)

    ## finding the abscent candidate to send to frontend for reset everything
    missing_candidates = list(set(constants.candidate_list) - set(candidate_order))
    # Sort the missing candidate to maintain a consistent order
    missing_candidates.sort(key=lambda x: constants.candidate_list.index(x))

    for mis_cand in missing_candidates:
        if mis_cand in absent_candidates['card_resetting']:
            absent_candidates['card_resetting'][mis_cand] = True

    return candidate_score, cand_curr_info, alert_notification, action_final, initial_appends, before, absent_candidates, frame_visual_area