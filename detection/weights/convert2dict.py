import torch

model = torch.load('yolov5m.pt', map_location='cpu')['model']
torch.save(model.state_dict(),'yolov5m_sd.pt')

model = torch.load('yolov5s.pt', map_location='cpu')['model']
torch.save(model.state_dict(),'yolov5s_sd.pt')

model = torch.load('yolov5l.pt', map_location='cpu')['model']
torch.save(model.state_dict(),'yolov5l_sd.pt')