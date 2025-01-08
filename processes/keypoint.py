from poseyolo import ypose

def keypoints_process(quit_flag, input_queue, out_queue):
    # print("Keypoint start")
    pose = ypose()
    while True:
        if quit_flag.value:
            break

        data = input_queue.get()
        if data is None:
            print("I am done head detector process")
            out_queue.put(data)
            continue
        
        points = pose.pose(data['frame'], data['boundingbox_dict'])#,data['head_detection'])
        data['pose_points'] = points
        out_queue.put(data)

"""
# import head.

# candidate_order = []
# head_candidate_mapping = {}

# def candidate_number_head(head, desk_roi):
#     keys = list(desk_roi.keys())
#     candidate_num = 0
#     center_point = ((head[0]+head[2])/2,(head[1]+head[3])/2)
#     for dsk in keys :
#         if desk_roi[dsk]['xmax'] >= center_point[0] >= desk_roi[dsk]['xmin'] and desk_roi[dsk]['ymax'] >= center_point[1] >= desk_roi[dsk]['ymin']:
#             candidate_num = int(dsk) 

#     if candidate_num > 0:
#         return candidate_num
#     else:
#         return print("No Candidate found in selected ROI")


        # heads = data['head_detection']
        # desk_roi = data['desk_roi']

        # candidate_number_head(heads, desk_roi)

        # for gz in range(len(heads)):
        #         candidate_num = candidate_number_head(heads[gz], desk_roi)
                
        #         if candidate_num is None:
        #             continue  # if no head in any of the ROI then skip all computation
                
        #         if candidate_num not in candidate_order:
        #             candidate_order.append(candidate_num)
        #             head_candidate_mapping[candidate_num] = gz
                    
        # # for gz in range(len(heads)):
        # # candidate_num = candidate_number_head(heads[gz], desk_roi)
        # myhead_bbox = {}
        # for la in head_candidate_mapping: #data['head_detection']:
        #     myhead_bbox[la] = [int(heads[int(head_candidate_mapping.get(la))][0]), int(heads[int(head_candidate_mapping.get(la))][1]), int(heads[int(head_candidate_mapping.get(la))][2]), int(heads[int(head_candidate_mapping.get(la))][3])]
        
        # points = pose.pose(data['frame'], myhead_bbox) #data['head_detection'])
        # points = pose.pose(data['frame']) #data['head_detection'])
        # print("points",points)

        # pose_data = looking_around_model2.pose(frame, myhead_bbox)

"""