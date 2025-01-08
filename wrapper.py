from datetime import datetime
import cv2
import multiprocessing as mp
from processes.video_loader import video_loader_fun
from processes.head import head_detection_process
from processes.keypoint import keypoints_process
from threading import Thread
from queue import Queue
from processes.drawing import drawing
from processes.analysis import data_computation
from storage_utils.storage_manager import storage_process
import constants
import base64
import json
import time
dict_const = __import__("constants")


class Stream:

    quit_flag = mp.Value('b', False)
    queue_size = constants.processes_queue_size
    manager = mp.Manager()
    config_dict = manager.dict()
    config_dict = constants_dict = {key: getattr(constants, key) for key in dir(constants) if not key.startswith("__")}
    video_loader_flag = mp.Value('b', False)

    queue_empty_flag = True
    
    ## Initializing all Queues

    video_queue = Queue(maxsize=queue_size) # Output of video_loader, imput to object detection
    head_detector_queue = Queue(maxsize=queue_size) # Head detector output, input to gaze points
    keypoints_queue = Queue(maxsize=queue_size)
    visualizer_queue = Queue(maxsize=queue_size) # Drawing output, input to main 
    analytics_queue = Queue(maxsize=queue_size)
    storage_queue = Queue(maxsize=queue_size)

    ## Making all Processes
    
    head_detect_process = Thread(target=head_detection_process,args=(quit_flag,video_queue,head_detector_queue))
    key_point_process = Thread(target=keypoints_process,args= (quit_flag,head_detector_queue,keypoints_queue))
    drawing_process = Thread(target=drawing,args=(quit_flag,keypoints_queue,visualizer_queue,video_loader_flag,config_dict))
    # drawing_process = Thread(target=drawing,args=(quit_flag,head_detector_queue,visualizer_queue,video_loader_flag,config_dict))
    analytical_process = Thread(target=data_computation,args=(quit_flag,visualizer_queue,analytics_queue,video_loader_flag,config_dict))
    storage_process = Thread(target=storage_process,args=(storage_queue,))

    ## Starting all Process

    drawing_process.start()
    analytical_process.start()
    storage_process.start()
    head_detect_process.start()
    key_point_process.start()
    
    def __init__(self) -> None:
        pass

    @classmethod
    def change_config(cls,desk_roi_drawing,objects_drawing,head_bbox_drawing,desk_number_drawing,visual_field_drawing,gaze,heat_map):
        Stream.config_dict.update({"desk_roi_drawing": eval(desk_roi_drawing)})
        Stream.config_dict.update({"objects_drawing": eval(objects_drawing)})
        Stream.config_dict.update({"head_bbox_drawing": eval(head_bbox_drawing)})
        Stream.config_dict.update({"desk_number_drawing": eval(desk_number_drawing)})
        Stream.config_dict.update({"visual_field_drawing": eval(visual_field_drawing)})
        Stream.config_dict.update({"gaze": eval(gaze)})
        Stream.config_dict.update({"heat_map": eval(heat_map)})

    @classmethod
    def check_empty(cls):
        # answer = Stream.video_queue.empty() and \
        # Stream.detic_output_queue.empty() and \
        # Stream.head_detector_queue.empty() and \
        # Stream.gaze_queue.empty() and \
        # Stream.visualizer_queue.empty() and \
        # Stream.analytics_queue.empty()
        # return answer


        answer = Stream.video_queue.empty() and \
        Stream.head_detector_queue.empty() and \
        Stream.visualizer_queue.empty() and \
        Stream.analytics_queue.empty()
        return answer

    @classmethod
    def empty_queue(cls):
        while not Stream.check_empty():
            Stream.analytics_queue.get()
            time.sleep(0.2)
        print("Queues are now empty")
        

    @classmethod
    def infer(cls, camera_id):
        Stream.empty_queue()
        print("in infer")
        # print(f"Video name received: {video_name}")
        print(f"camera_id received: {camera_id}")
        print("Before video flag from wrapper: ",Stream.video_loader_flag.value)
        if Stream.video_loader_flag.value == True:
            Stream.video_loader_flag.value = False
        print("After video flag from wrapper: ",Stream.video_loader_flag.value)
        video_loader_process = Thread(target=video_loader_fun,args=(camera_id, Stream.quit_flag, Stream.video_queue, Stream.video_loader_flag))
        video_loader_process.start()
        while True: # Main Process
            if Stream.quit_flag.value:
                break
            start_time = time.time()
            data = Stream.analytics_queue.get()
            if Stream.video_loader_flag.value:
                break
            _,frame_encoded = cv2.imencode(".jpg", data['processed_image'])
            frame_base64 = base64.b64encode(frame_encoded).decode('utf-8')
            stats = {
                "analytics": data['analytical_computation'],
                "behaviour": data['behaviour'],
                "absent": data['absentees'],
                "alert": data['alert_notification']
            }
            if data['alert_notification']:
                temp = {
                            "frame":data['processed_image'],
                            "alert":data['alert_notification'],
                            "raw_frame":data['frame'],
                            "cam_id" : camera_id
                        }
                Stream.storage_queue.put(temp)
            response_content = (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame_base64.encode('utf-8') + b"\r\n\r\n"
                b"--frame\r\n"
                b"Content-Type: application/json\r\n\r\n" + json.dumps(stats).encode('utf-8') + b"\r\n\r\n"
            )
                    
            print("fps =", 1.0 / (time.time() - start_time + 0.0001))
            yield response_content