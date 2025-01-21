input_video = 'video_2.mp4'

processes_queue_size = 5

action_window_buffer_size = 5

# action_anomaly_precedence = [4,1,2,8] # 1: Hand Riased, 2: Using Mobile Phone, 3: Student Interaction with Invigilator, 4: Looking Around
#                                         # Higher value indicates more precedence

action_anomaly_precedence_dict = {
    "Raising Hand":4,
    "Using Mobile Phone":1,
    "Student Interacting with Invigilator":8,
    "Looking Around":2
}

avg_action_threshold = 0.8

candidate_list = [1,2,3,4]

desk_roi_drawing = True
objects_drawing = False
hand_bbox_drawing = True
head_bbox_drawing = False
desk_number_drawing = True
visual_field_drawing = True
gaze = False
heat_map = False
overlap_threshold = 65

URL =  'mongodb://localhost:27017/'
DB_NAME =  'qiyas'
ALERT_COLLECTION = 'alerts'
CAMERA_COLLECTION = 'camera'

