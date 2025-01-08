import torch
import torch.nn as nn

from detection.trackers.custom_tracker.yolov7_detector.models.yolo import Model
from detection.trackers.custom_tracker.yolov7_detector.models.experimental import Ensemble
from detection.trackers.custom_tracker.yolov7_detector.models.common import Conv

def attempt_load(weights, model_config, map_location=None):

    model = Ensemble()
    # for w in weights if isinstance(weights, list) else [weights]:
    #     attempt_download(w)
    #     print(w)
    #     model.append(torch.load(w, map_location=map_location)['model'].float().fuse().eval())  # load FP32 model

    for w in weights if isinstance(weights, list) else [weights]:
        mdl = Model(cfg=model_config)
        # weights = list(torch.load(w).keys())
        # print(weights)
        # for key in mdl.state_dict():
        #     if key not in weights:
        #         print(key)
        #         print(1/0)
        mdl.load_state_dict(torch.load(w))
        mdl.to(map_location)

        model.append(mdl.fuse().eval())

    # Compatibility updates
    for m in model.modules():
        if type(m) in [nn.Hardswish, nn.LeakyReLU, nn.ReLU, nn.ReLU6, nn.SiLU]:
            m.inplace = True  # pytorch 1.7.0 compatibility
        elif type(m) is Conv:
            m._non_persistent_buffers_set = set()  # pytorch 1.6.0 compatibility

    if len(model) == 1:
        return model[-1]  # return model
    else:
        print('Ensemble created with %s\n' % weights)
        for k in ['names', 'stride']:
            setattr(model, k, getattr(model[-1], k))
        return model  # return ensemble


