from detection.trackers.custom_tracker.tracker.deep_sort import nn_matching
from detection.trackers.custom_tracker.tracker.deep_sort.detection import Detection
from detection.trackers.custom_tracker.tracker.deep_sort.tracker import Tracker
from detection.trackers.custom_tracker import settings


class DeepSortTracker:
    def __init__(self):
        self.metric = nn_matching.NearestNeighborDistanceMetric(
            "cosine", settings.MAX_COSINE_DISTANCE, None)
        self.tracker = Tracker(self.metric)

    def create_detections(self, detections, features):
        detection_list = []
        for det, feat in zip(detections, features):
            bbox = [det[0], det[1], det[2]-det[0], det[3]-det[1]]
            detection_list.append(Detection(bbox, 1, feat))
        return detection_list

    def get_tracks(self, model_detections, features):

        if len(features) == 0:
            for track in self.tracker.tracks:
                if not track.is_confirmed():
                    continue
                track.time_since_update += 1
                track.mark_missed()
            return []


        # Load image and generate detections.
        detections = self.create_detections(model_detections, features)

        # Run non-maxima suppression.
        # boxes = np.array([d.tlwh for d in detections])
        # scores = np.array([d.confidence for d in detections])
        # indices = preprocessing.non_max_suppression(
        #     boxes, self.nms_max_overlap, scores)
        # detections = [detections[i] for i in indices]

        # Update tracker.
        self.tracker.predict()
        self.tracker.update(detections)

        # Store results.
        results = []
        for track in self.tracker.tracks:
            if not track.is_confirmed() or track.time_since_update > 1:
                continue
            bbox = track.to_tlwh()
            # results.append([-1, track.track_id, bbox[0], bbox[1], bbox[2], bbox[3], 1, -1, -1, -1])
            results.append([track.track_id, bbox[0], bbox[1], bbox[2] + bbox[0], bbox[3] + bbox[1]])

        return results
