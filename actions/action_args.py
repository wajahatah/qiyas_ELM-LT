# basic
img_size = 224 # help='the size of input frame'
show = True # help='show the visulization results.'
cuda = True # help='use cuda.'
save_folder = 'det_results/' # help='Dir to save results'
vis_thresh = 0.55 # help='threshold for visualization'
video = "" # help='AVA video name.'
gif = 'False' # help='generate gif.'

# class label config
dataset = 'ava_v2.2'
pose = False # help='show 14 action pose of AVA.'

# model
version = 'yowo_v2_tiny' # help='build YOWOv2'
weight = "models_1\yowo_v2_tiny_epoch_300.pth" # help='Trained state_dict file path to open'
conf_thresh = 0.3 # help='confidence threshold'
nms_thresh = 0.5 # help='NMS threshold'
topk = 40 # help='NMS threshold'
len_clip = 16 # help='video clip length.'
memory = False # help="memory propagate."

iou_threshold = 0.05 # for matching iou between head detections bbox and the yowov2 detection bbox

# parser = argparse.ArgumentParser(description='YOWOv2 Demo')

#     # basic
#     parser.add_argument('-size', '--img_size', default=224, type=int,
#                         help='the size of input frame')
#     parser.add_argument('--show', action='store_true', default=True,
#                         help='show the visulization results.')
#     parser.add_argument('--cuda', action='store_true', default=False, 
#                         help='use cuda.')
#     parser.add_argument('--save_folder', default='det_results/', type=str,
#                         help='Dir to save results')
#     parser.add_argument('-vs', '--vis_thresh', default=0.05, type=float,
#                         help='threshold for visualization')
#     parser.add_argument('--video', default="video_1.mp4", type=str,
#     #parser.add_argument('--video', default="/home/haithemt/actionrecognition/YOWOv2/videos/Video_7.mp4", type=str,
#                         help='AVA video name.')
#     parser.add_argument('--gif', action='store_true', default=False, 
#                         help='generate gif.')

#     # class label config
#     parser.add_argument('-d', '--dataset', default='ava_v2.2',
#                         help='ava_v2.2')
#     parser.add_argument('--pose', action='store_true', default=False, 
#                         help='show 14 action pose of AVA.')

#     # model
#     parser.add_argument('-v', '--version', default='yowo_v2_medium', type=str,
#                         help='build YOWOv2')
#     parser.add_argument('--weight', default="weights\yowo_v2_medium_epoch_50.pth",
#                         type=str, help='Trained state_dict file path to open')
#     parser.add_argument('-ct', '--conf_thresh', default=0.1, type=float,
#                         help='confidence threshold')
#     parser.add_argument('-nt', '--nms_thresh', default=0.5, type=float,
#                         help='NMS threshold')
#     parser.add_argument('--topk', default=40, type=int,
#                         help='NMS threshold')
#     parser.add_argument('-K', '--len_clip', default=16, type=int,
#                         help='video clip length.')
#     parser.add_argument('-m', '--memory', action="store_true", default=False,
#                         help="memory propagate.")