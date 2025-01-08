import cv2
import torch
from PIL import Image
from torchreid.reid.utils import FeatureExtractor
from detection.trackers.custom_tracker import settings
import time

class FeatureExtractorController:
    def __init__(self):
        if torch.cuda.is_available():
            self.device = 'cuda'
        else:
            self.device = 'cpu'
        model_path = settings.OSNET_MODEL_PATH
        if model_path is None:
            model_path = ''
        self.extractor = FeatureExtractor(
            model_name=settings.MODEL_NAME,
            device=self.device,
             model_path = model_path 
        )

    def get_features(self, img, detections):
        # total_time = time.time()
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        images = []
        for det in detections:
            x1, y1, x2, y2 = int(det[0]), int(det[1]), int(det[2]), int(det[3])
            image = Image.fromarray(img[y1:y2, x1:x2, :])
            image = self.extractor.preprocess(image)
            images.append(image)

        if len(images) == 0:
            return []
        images = torch.stack(images, dim=0)
        images = images.to(self.device)
        # print("Preprocessing time", time.time() - total_time, self.device)
        t2 = time.time()
        with torch.no_grad():
            features = self.extractor.model(images).cpu().data.numpy()
        #print("model time", time.time() - t2)
        # print("Total time", time.time() - total_time)
        return features

