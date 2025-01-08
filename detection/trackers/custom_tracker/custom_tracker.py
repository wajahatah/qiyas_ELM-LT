import time
import numpy as np
# from trackers.custom_tracker.detector.person_and_head_detector import Detector
from detection.trackers.custom_tracker.yolov7_detector.visible_person_detector import Detector
from detection.trackers.custom_tracker.tracker.deep_sort_tracker import DeepSortTracker
from detection.trackers.custom_tracker.feature_extractor.feature_extractor import FeatureExtractorController
import logging

# logging.basicConfig(format='%(asctime)s,%(msecs)d %(levelname)-8s [%(filename)s:%(lineno)d] %(message)s',
#     datefmt='%Y-%m-%d:%H:%M:%S',
#     level=logging.DEBUG)

# logger = logging.getLogger(__name__)

class Tracker:
    def __init__(self, frame_rate = 30, img_size=(1088, 608)):
        #self.detector = Detector()
        self.extractor = FeatureExtractorController()
        self.tracker = DeepSortTracker()

    def get_tracks(self, frame, detections):
        """

        :param frame:
        :return: tracks 2d array with values in following format
                '[[-1,{id},{x1},{y1},{w},{h},1,-1,-1,-1]]'
        """
        t1 = time.time()
        # logger.debug("Frame Shape in tracker detections {}".format(frame.shape))
        # detections = self.detector.get_detections(frame)[0]
        # print("detections")
        # print(detections)
        # print("detection time", time.time()-t1)
        t1 = time.time()
        features = self.extractor.get_features(frame, detections)

        # print("feature time", time.time()-t1)
        t1 = time.time()
        tracks = self.tracker.get_tracks(detections, features)
        # print("total tracking time", time.time() - t1)

        # print("Detection: ")
        # print(detections)
        # print("tracks: ")
        # print(tracks)

        return np.array(tracks)
# detection time 1.183598279953003
# feature time 0.002003192901611328
# total tracking time 9.059906005859375e-06

# detection time 1.1763627529144287
# feature time 0.0021016597747802734
# total tracking time 8.344650268554688e-06

# detection time 0.024477720260620117
# feature time 0.0005326271057128906
# total tracking time 5.245208740234375e-06