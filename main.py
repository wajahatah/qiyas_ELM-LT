import cv2
import multiprocessing as mp
from processes.video_loader import video_loader_fun
from processes.detic import detic_object_detection
from processes.head import head_detection_process
from processes.gaze import gaze_process
from threading import Thread
from queue import Queue
from processes.action import action_det
from processes.drawing import drawing
from processes.analysis import data_computation
import constants
import time
if __name__ == '__main__':   
    input_video = constants.input_video
    quit_flag = mp.Value('b', False)
    queue_size = constants.processes_queue_size

    ## Initializing all Queues
    video_queue = Queue(maxsize=queue_size) # Output of video_loader, imput to object detection
    detic_output_queue = Queue(maxsize=queue_size) # Detic output, input to head detection
    head_detector_queue = Queue(maxsize=queue_size) # Head detector output, input to gaze points
    gaze_queue = Queue(maxsize=queue_size) # Gaze output, input action detection
    action_queue = Queue(maxsize=queue_size) # Action output, input to visualizer
    visualizer_queue = Queue(maxsize=queue_size) # Drawing output, input to main 
    analytics_queue = Queue(maxsize=queue_size)

    ## Making all Processes
    video_loader_process = Thread(target=video_loader_fun,args=(input_video,quit_flag,video_queue))
    detic_process = Thread(target=detic_object_detection,args=(quit_flag,video_queue,detic_output_queue))
    head_detect_process = Thread(target=head_detection_process,args=(quit_flag,detic_output_queue,head_detector_queue))
    gaze_point_process = Thread(target=gaze_process,args=(quit_flag,head_detector_queue,gaze_queue))
    action_det_process = Thread(target=action_det,args=(quit_flag,gaze_queue,action_queue))
    drawing_process = Thread(target=drawing,args=(quit_flag,action_queue,visualizer_queue))
    analytical_process = Thread(target=data_computation,args=(quit_flag,visualizer_queue,analytics_queue))


    ## Starting all Process
    video_loader_process.start()
    detic_process.start()
    head_detect_process.start()
    gaze_point_process.start()
    action_det_process.start()
    drawing_process.start()
    analytical_process.start()


    while True: # Main Process
        if quit_flag.value:
            break
        start_time = time.time()
        data = analytics_queue.get()
        if data is None:
            break
        cv2.namedWindow("Processed Frame", cv2.WINDOW_NORMAL) 
        cv2.imshow("Processed Frame", data['processed_image'])
        # print(data['action_det'])
        # print(data['behaviour'])
        print(data['alert_notification'])
            
        print("fps =", 1.0 / (time.time() - start_time + 0.0001))
        if cv2.waitKey(1) == ord("q"):
            cv2.destroyAllWindows()
        








