from ultralytics import YOLO
import torch
class ObjectDetector:
    def __init__(self):
        self.model = YOLO("models_1/best_obj_ver_1.pt", task="detect")
        empty_input = torch.empty(1, 3, 640, 640).to('cuda')
        with torch.no_grad():
            out = self.model(empty_input)
            self.classes = out[0].names

    def infer_image(self, frame):
        outputs = self.model.predict(frame, verbose=False, device="cuda:0")
        reponse = []
        for output in outputs:
            temp = []
            for box, cls in zip(output.boxes.xyxy,output.boxes.cls):
                temp.append((box.to('cpu').int().tolist(),self.classes[int(cls.to('cpu'))]))
            reponse.append(temp)
        return reponse


