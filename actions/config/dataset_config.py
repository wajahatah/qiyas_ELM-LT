# Dataset configuration


dataset_config = {
    
    'ucf24': {
        # dataset
        'gt_folder': './evaluator/groundtruths_ucf_jhmdb/groundtruths_ucf/',
        # input size
        'train_size': 224,
        'test_size': 224,
        # transform
        'jitter': 0.2,
        'hue': 0.1,
        'saturation': 1.5,
        'exposure': 1.5,
        'sampling_rate': 1,
        # cls label
        'multi_hot': False,  # one hot
        # optimizer
        'optimizer': 'adamw',
        'momentum': 0.9,
        'weight_decay': 5e-4,
        # warmup strategy
        'warmup': 'linear',
        'warmup_factor': 0.00066667,
        'wp_iter': 500,
        # class names
        'valid_num_classes': 24,
        'label_map': (
                    'Basketball',     'BasketballDunk',    'Biking',            'CliffDiving',
                    'CricketBowling', 'Diving',            'Fencing',           'FloorGymnastics', 
                    'GolfSwing',      'HorseRiding',       'IceDancing',        'LongJump',
                    'PoleVault',      'RopeClimbing',      'SalsaSpin',         'SkateBoarding',
                    'Skiing',         'Skijet',            'SoccerJuggling',    'Surfing',
                    'TennisSwing',    'TrampolineJumping', 'VolleyballSpiking', 'WalkingWithDog'
                ),
    },
    
'ava_v2.2':{
        # dataset
        'frames_dir': 'C:/OsamaEjaz/YowoV2_train_test/data_new/frames/Elm-_Action_Recognition-RTSP_19-chunk_21-05-24_09-46/images',
        'frame_list': 'C:/OsamaEjaz/YowoV2_train_test/data_new/AVA_Dataset/frame_lists/',
        'annotation_dir': 'C:/OsamaEjaz/YowoV2_train_test/data_new/frames/Elm-_Action_Recognition-RTSP_19-chunk_21-05-24_09-46/',
        'train_gt_box_list': 'C:/OsamaEjaz/YowoV2_train_test/data_new/AVA_Dataset/annotations/train_gt_box_list.csv',
        'val_gt_box_list': 'C:/OsamaEjaz/YowoV2_train_test/data_new/AVA_Dataset/annotations/val_gt_box_list.csv', 
        'train_exclusion_file': 'ava_train_excluded_timestamps_v2.2.csv',
        'val_exclusion_file': 'ava_val_excluded_timestamps_v2.2.csv',
        'labelmap_file': 'C:/OsamaEjaz/YowoV2_train_test/data_new/AVA_Dataset/annotations/action_list.pbtxt',
        'backup_dir': 'results/', 
        
        # input size
        'train_size': 224,
        'test_size': 224,
        
        # transform
        'jitter': 0.2,
        'hue': 0.1,
        'saturation': 0.5,
        'exposure': 0.5,
        'sampling_rate': 1,
        
        # cls label
        'multi_hot': True,  # multi hot
        
        # train config
        'optimizer': 'adamw',
        'momentum': 0.9,
        'weight_decay': 5e-4,
        
        # warmup strategy
        'warmup': 'linear',
        'warmup_factor': 0.00066667,
        'wp_iter': 500,
        
        # class names
        'valid_num_classes':3,
        'label_map': (#'Walking and checking smartphone',
                    #   'Talking on the smartphone',
                    #   'Talking to another person',
                    #   'Standing and talking on the smartphone',
                    #   'Standing and checking smartphone',
                    #   'Sitting', 
                    #   'Standing', 
                    #   'Walking', 
                    #   'Using laptops, tablets, and smartphones', 
                    #   'Talking to each other', 
                    #   'Taking photos and videos', 
                    #   'Giving a presentations', 
                    #   'Audience member listening',
                    #   'Chaking hands', 
                    #   'Changing business cards and contacts',

                        # 'looking around',
                        # 'looking backward',
                        'raising hand',
                        # 'standing up',
                        'using mobile phone',
                        # 'sitting',
                        # 'use mouse/keyboard',
                        # 'writing on tablet',
                        # 'drinking water', 
                        'student interacting with invigilator'
                        # 'P1',
                        # 'P2',
                        # 'P3',
                        # 'P4',
                        # 'P5',
                        # 'P6',
                        # 'P7',
                        # 'P8',
                        # 'P9',
                        # 'P10',
                        # 'P11',
                        # 'P12',
                        # 'P13',
                        # 'P14',
                        # 'P15',
                        # 'P16',
                        # 'P17',
                        # 'P18',
                        # 'P19',
                        # 'P20'
                ),
    }

}
