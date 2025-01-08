from head_detec.head_detector import YoloV5headdetector
import json

def head_detection_process(quit_flag,input_queue,out_queue):
    head_model = YoloV5headdetector()
    while True:
        if quit_flag.value:
            break

        data = input_queue.get()
        # print("data", data)
        if data is None:
            print("I am done head detector process")
            out_queue.put(data)
            continue
        
        head_detection, stand_flag, stand_bbox, stand_head,head_dict = head_model.head_bbox(data['frame'], data['desk_roi'])

        data['head_detection'] = head_detection#.cpu()
        # print("head", head_detection)
        data['stand_flag'] = stand_flag
        data['stand_bbox'] = stand_bbox
        data['boundingbox_dict'] = head_dict
        # print("head dict:", head_dict)

        hand_flag, hand_bbox = head_model.check_hand_raised(data['frame'], head_detection)

        data['hand_flag'] = hand_flag
        data['hand_bbox'] = hand_bbox
        data['stand_head'] = stand_head
        out_queue.put(data)