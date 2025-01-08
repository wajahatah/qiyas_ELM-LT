# from detection.detector import ObjectDetector
from yolo_detic.yolo_detection import ObjectDetector

def detic_object_detection(quit_flag,input_queue,out_queue):
    detic = ObjectDetector()
    while True:
        if quit_flag.value:
            break
        
        data = input_queue.get()
        if data is None:
            print("I am done detic process")
            out_queue.put(data)
            continue

        object_detection = detic.infer_image(data['frame'])
        data['object_detection']  = object_detection[0]
        out_queue.put(data)