from analytics.output_analysis import analytical_computation

def data_computation(quit_flag,input_queue,out_queue,refresh_flag,config_dict):
    candidate_score = {  1 : {"keyboard" : 0,
                    "monitor" : 0,
                    "computer" : 0,
                    "mobile phone" : 0,
                    "Other": 0,
                    "Att_Score": 0},

                2 : {"keyboard" : 0,
                    "monitor" : 0,
                    "computer" : 0,
                    "mobile phone" : 0,
                    "Other": 0,
                    "Att_Score": 0},

                3 : {"keyboard" : 0,
                    "monitor" : 0,
                    "computer" : 0,
                    "mobile phone" : 0,
                    "Other": 0,
                    "Att_Score": 0},

                4 : {"keyboard" : 0,
                    "monitor" : 0,
                    "computer" : 0,
                    "mobile phone" : 0,
                    "Other": 0,
                    "Att_Score": 0}
                    }
    initial_appends = True
    before = ['Normal', 'Normal', 'Normal', 'Normal']

    while True:
        if quit_flag.value:
            break
        if refresh_flag.value:
            candidate_score = {  1 : {"keyboard" : 0,
                    "monitor" : 0,
                    "computer" : 0,
                    "mobile phone" : 0,
                    "Other": 0,
                    "Att_Score": 0},

                2 : {"keyboard" : 0,
                    "monitor" : 0,
                    "computer" : 0,
                    "mobile phone" : 0,
                    "Other": 0,
                    "Att_Score": 0},

                3 : {"keyboard" : 0,
                    "monitor" : 0,
                    "computer" : 0,
                    "mobile phone" : 0,
                    "Other": 0,
                    "Att_Score": 0},

                4 : {"keyboard" : 0,
                    "monitor" : 0,
                    "computer" : 0,
                    "mobile phone" : 0,
                    "Other": 0,
                    "Att_Score": 0}
                    }
            before = ['Normal', 'Normal', 'Normal', 'Normal']

        data = input_queue.get()
        if data is None:
            print("I am done analytics process")
            out_queue.put(data)
            continue
        
        candidate_score,cand_curr_info, alert_notification,\
        action_final, initial_appends, before, absentees, frame_with_visual_area = analytical_computation(candidate_score,desk_roi = data['desk_roi'], 
                                                                                initial_appends = initial_appends, 
                                                                                before = before,
                                                                                hand_flag = data['hand_flag'],
                                                                                heads = data['head_detection'],
                                                                                heads_dict = data['boundingbox_dict'],
                                                                                pose_data = data['pose_points'],
                                                                                stand_bbox = data['stand_bbox'],
                                                                                frame = data['processed_image'],
                                                                                config_dict=config_dict,
                                                                                raw_frame=data['frame'],
                                                                                stand_head=data['stand_head'],
                                                                                in_angle=data['in_angle'],
                                                                                ex_angle=data['ex_angle']
                                                                                )
        # print(head_detection)
        data['analytical_computation'] = cand_curr_info
        data['behaviour'] = action_final
        data['alert_notification'] = alert_notification
        data['absentees'] = absentees
        data['processed_image'] = frame_with_visual_area
        
        out_queue.put(data)

