# Copyright (c) Facebook, Inc. and its affiliates.
from detection.detic.modeling.meta_arch import custom_rcnn
from detection.detic.modeling.roi_heads import detic_roi_heads
from detection.detic.modeling.roi_heads import res5_roi_heads
from detection.detic.modeling.backbone import swintransformer
from detection.detic.modeling.backbone import timm


from detection.detic.data.datasets import lvis_v1
from detection.detic.data.datasets import imagenet
from detection.detic.data.datasets import cc
from detection.detic.data.datasets import objects365
from detection.detic.data.datasets import oid
from detection.detic.data.datasets import coco_zeroshot

try:
    from detection.detic.modeling.meta_arch import d2_deformable_detr
except:
    pass