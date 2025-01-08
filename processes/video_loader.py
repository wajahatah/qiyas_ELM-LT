import cv2
from storage_utils.db_manager import db_manager
def video_loader_fun(camera_id,quit_flag,out_queue,stop_flag):
    print("Video loader created")
    db = db_manager()
    input_video, roi = db.get_cam_attributes(camera_id=camera_id)
    cap = cv2.VideoCapture(input_video)
    print("in ",input_video)
    while cap.isOpened():
        # print("inside while loop")
        if (quit_flag.value or stop_flag.value):
            print("Video loader is exiting")
            break
        ret, frame = cap.read()
        ret, frame = cap.read()
        ret, frame = cap.read()
        if not ret:
            # obj = None
            print("My work is done video loader")
            stop_flag.value = True
            break
        frame = cv2.resize(frame,(1280,720))
        obj = {
            "frame": frame,
            "desk_roi":roi
        }
        out_queue.put(obj)
    cap.release()