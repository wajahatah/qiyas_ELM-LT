import cv2

def drawing(quit_flag,input_queue,out_queue, refresh_flag,config_dict):
    while True:
        if quit_flag.value:
            break

        data = input_queue.get()
        if data is None:
            print("I am done drawing process")
            out_queue.put(data)
            continue

        raw_frame = data['frame']
        frame = raw_frame.copy()
        desk_roi = data['desk_roi']
        
        if config_dict.get('desk_number_drawing'):
            for dsk, rois in desk_roi.items():
                cv2.putText(frame, dsk, (rois['xmin'] + 60, rois['ymin'] + 20), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3, cv2.LINE_AA)

        if config_dict.get('desk_roi_drawing'): 
            cv2.rectangle(frame,(int(desk_roi['1']['xmin']), int(desk_roi['1']['ymin'])),(int(desk_roi['1']['xmax']),int(desk_roi['1']['ymax'])),(255,0,255),2)
            cv2.rectangle(frame,(int(desk_roi['2']['xmin']), int(desk_roi['2']['ymin'])),(int(desk_roi['2']['xmax']),int(desk_roi['2']['ymax'])),(255,0,255),2)
            cv2.rectangle(frame,(int(desk_roi['3']['xmin']), int(desk_roi['3']['ymin'])),(int(desk_roi['3']['xmax']),int(desk_roi['3']['ymax'])),(255,0,255),2)
            cv2.rectangle(frame,(int(desk_roi['4']['xmin']), int(desk_roi['4']['ymin'])),(int(desk_roi['4']['xmax']),int(desk_roi['4']['ymax'])),(255,0,255),2)

        if config_dict.get('head_bbox_drawing'):
            head_detection = data['boundingbox_dict']
            # if len(head_detection) > 0:
            #     for j in range(len(head_detection)):
            #         cv2.rectangle(frame,(int(head_detection[j][0]), int(head_detection[j][1])),(int(head_detection[j][2]),int(head_detection[j][3])),(255,0,255),2)
            for key, value in head_detection.items():
                cv2.rectangle(frame,(int(value[0]), int(value[1])),(int(value[2]),int(value[3])),(255,0,255),2)
            

        if config_dict.get('hand_bbox_drawing'):
            hand_bb = data['hand_bbox']
            if len(hand_bb) > 0:
                for j in range(len(hand_bb)):
                    cv2.rectangle(frame,(int(hand_bb[j][0]), int(hand_bb[j][1])),(int(hand_bb[j][2]),int(hand_bb[j][3])),(255,0,0),2)

        data['processed_image'] = frame
        out_queue.put(data)
