import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
import torchvision.transforms.functional as TF
from torch.autograd import Variable
import torch.optim as optim
import torch.nn as nn
import torch.nn.functional as F
from torch.nn import DataParallel
# from models.gazenet import GazeNet

import time
import os
import numpy as np
import json
import cv2
from PIL import Image, ImageOps
import random
from tqdm import tqdm
import operator
import itertools
from scipy.io import  loadmat
import logging

from scipy import signal
import matplotlib.pyplot as plt

import json

import pickle
from skimage import io
from dataloader import chong_imutils

import pandas as pd
from os import listdir
from os.path import isfile, join
import pickle
np.random.seed(1)
def _get_transform(input_resolution):
    transform_list = []
    transform_list.append(transforms.Resize((input_resolution, input_resolution)))
    transform_list.append(transforms.ToTensor())
    transform_list.append(transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]))
    return transforms.Compose(transform_list)

class DarwinDataset(Dataset) :
    def __init__(self, root_dir, json_file_path, training='train', include_path=False, input_size=224, output_size=64, imshow = True, use_gtbox=False, pickle_flag=False):
        assert (training in set(['train', 'test']))

        self.root_dir = root_dir
        # self.mat_file = mat_file
        self.training = training
        self.include_path = include_path
        self.input_size = input_size
        self.output_size = output_size
        self.imshow = imshow
        self.transform = _get_transform(input_size)
        self.use_gtbox= use_gtbox

        self.data_mat = []




        self.data = [f for f in listdir(json_file_path) if isfile(join(json_file_path, f))]

        print(self.data)
        self.image_num = 0#len(self.data)
        self.image_count = len(self.data)

        # if pickle_flag == False:
        #     print("self.image_count :", self.image_count)
        #     data_file = self.data[0]
        #     print(data_file)
        #     for id in range(0,self.image_count) :
        #         print("processing image id :", id)
        #         self.process(id)

        if pickle_flag :

            if training=='train':

                for id in range(300,900,100) :
                    print("id is :", id)
                    with open('D://classroom_data//train_data_allfaces_objects_newchannel_attention_batch2_' + str(id) + '.pickle', 'rb') as handle:
                        data_mat = pickle.load(handle)
                        print("samples in file ::", len(data_mat))
                        # counting = 0 
                        # while counting < 250 :
                        for i in range(len(data_mat)) :
                            # print("i is :", i )
                            # print(data_mat[i])
                            img, face, head_channel, gaze_heatmap, object_channel, image_path, gaze_inside = data_mat[i]
                            # self.data_mat.append([img, face, head_channel, gaze_heatmap, object_channel, image_path, gaze_inside])
                            self.data_mat.append([img, face, head_channel, gaze_heatmap, image_path, gaze_inside])
                            print("num of train samples :", len(self.data_mat))
                            # counting +=1

            # else :
            #     with open('test_data_input448.pickle', 'rb') as handle:
            #         data_mat  = pickle.load(handle)



            # if training=='train':
            #     for i in range(1800) :
            #         img, face, head_channel, gaze_heatmap, object_channel, image_path, gaze_inside = data_mat[i]
            #         self.data_mat.append([img, face, head_channel, gaze_heatmap, object_channel, image_path, gaze_inside])

            #     for i in range(2100,6100) :
            #         img, face, head_channel, gaze_heatmap, object_channel, image_path, gaze_inside = data_mat[i]
            #         self.data_mat.append([img, face, head_channel, gaze_heatmap, object_channel, image_path, gaze_inside])


                # for i in range(80) :
                #     img, face, head_channel, gaze_heatmap, image_path, gaze_inside = data_mat[i]
                #     self.data_mat.append([img, face, head_channel, gaze_heatmap, image_path, gaze_inside])


 
            # else :
            #     for i in range(800) :
            #         img, face, head_channel, eye, gaze_heatmap, object_channel, gaze, gaze_inside, image_path = data_mat[i]
            #         self.data_mat.append([img, face, head_channel, eye, gaze_heatmap, object_channel, gaze, gaze_inside, image_path])
                
                # for i in range(80) :
                #     img, face, head_channel, eye, gaze_heatmap, gaze, gaze_inside, image_path = data_mat[i]
                #     self.data_mat.append([img, face, head_channel, eye, gaze_heatmap, gaze, gaze_inside, image_path])



            self.image_num = len(self.data_mat)
            print("training flag is : ", training)
            print("size of data is :", len(self.data_mat ))

            # return dset


    def __len__(self):
        return self.image_num-1

    def __getitem__(self, idx):

        # print("train data index is :", idx)


        if self.training == 'train':
            # img, face, head_channel, gaze_heatmap, object_channel, image_path, gaze_inside = self.data_mat[idx]
            img, face, head_channel, gaze_heatmap, image_path, gaze_inside = self.data_mat[idx]

        elif self.training == 'test':
            img, face, head_channel, eye, gaze_heatmap, object_channel, gaze, gaze_inside, image_path = self.data_mat[idx]

        
        if self.training == 'train':
            # return img, face, head_channel, gaze_heatmap, object_channel, image_path, gaze_inside
            return img, face, head_channel, gaze_heatmap, image_path, gaze_inside

        elif self.training == 'test':
            return img, face, head_channel, eye, gaze_heatmap,object_channel, gaze, gaze_inside, image_path



    def process(self, idx):
        # print("inside Darwim get item !!!!!!!!!!!!!!!!!!")
        gaze_inside = True
        data_file = self.data[idx]
        # print("data_file :::", data_file)

        json_file = open(os.path.join(self.root_dir, 'labels',data_file))

        data = json.load(json_file)
    

        gaze_counter = 0
        head_counter = 0
        gaze_head_counter = 0

        # idx_gazedirection = [i for i in range(len(data['annotations'])) for val in data['annotations'][i]['name'] if val== "Gaze direction"]
        # idx_human = [i for i in range(len(data['annotations'])) for val in data['annotations'][i]['name'] if val== "Participants" or val =="Lecturer" ]

        # eye_x = [float(data['annotations'][i]['line']['path'][0]['x'])/width_orig for i in idx_gazedirection for j in idx_human if data['annotations'][i]['line']['path'][0]['x'] > data['annotations'][j]['bounding_box']['x'] and data['annotations'][i]['line']['path'][0]['x'] < data['annotations'][j]['bounding_box']['x'] + data['annotations'][j]['bounding_box']['w'] and data['annotations'][i]['line']['path'][0]['y'] > data['annotations'][j]['bounding_box']['y'] and data['annotations'][i]['line']['path'][0]['y'] < data['annotations'][j]['bounding_box']['y'] + data['annotations'][j]['bounding_box']['h'] ]
        
        # eye_y = [float(data['annotations'][i]['line']['path'][0]['y'])/height_orig for i in idx_gazedirection for j in idx_human if data['annotations'][i]['line']['path'][0]['x'] > data['annotations'][j]['bounding_box']['x'] and data['annotations'][i]['line']['path'][0]['x'] < data['annotations'][j]['bounding_box']['x'] + data['annotations'][j]['bounding_box']['w'] and data['annotations'][i]['line']['path'][0]['y'] > data['annotations'][j]['bounding_box']['y'] and data['annotations'][i]['line']['path'][0]['y'] < data['annotations'][j]['bounding_box']['y'] + data['annotations'][j]['bounding_box']['h'] ]
        
        # gaze_x = [float(data['annotations'][i]['line']['path'][1]['x'])/width_orig for i in idx_gazedirection if data['annotations'][i]['line']['path'][0]['x'] > data['annotations'][j]['bounding_box']['x'] and data['annotations'][i]['line']['path'][0]['x'] < data['annotations'][j]['bounding_box']['x'] + data['annotations'][j]['bounding_box']['w'] and data['annotations'][i]['line']['path'][0]['y'] > data['annotations'][j]['bounding_box']['y'] and data['annotations'][i]['line']['path'][0]['y'] < data['annotations'][j]['bounding_box']['y'] + data['annotations'][j]['bounding_box']['h'] for j in idx_human]
        # gaze_y = [float(data['annotations'][i]['line']['path'][1]['y'])/height_orig for i in idx_gazedirection if data['annotations'][i]['line']['path'][0]['x'] > data['annotations'][j]['bounding_box']['x'] and data['annotations'][i]['line']['path'][0]['x'] < data['annotations'][j]['bounding_box']['x'] + data['annotations'][j]['bounding_box']['w'] and data['annotations'][i]['line']['path'][0]['y'] > data['annotations'][j]['bounding_box']['y'] and data['annotations'][i]['line']['path'][0]['y'] < data['annotations'][j]['bounding_box']['y'] + data['annotations'][j]['bounding_box']['h'] for j in idx_human]
        # print("idx_gazedirection :::::::::::::",len(idx_gazedirection))
        # print("idx_human :::::::::::::",len(idx_human))

        # eye = eye_x, eye_y
        # gaze =gaze_x, gaze_y 

        # x_min = [(data['annotations'][j]['bounding_box']['x']/width_orig) * width for j in idx_human ]#(eye_x - 0.01) * width
        # y_min = [(data['annotations'][j]['bounding_box']['y']/height_orig) * height for j in idx_human ]#(eye_y - 0.01) * height
        # x_max = [(data['annotations'][j]['bounding_box']['x']/width_orig + data['annotations'][j]['bounding_box']['w']/width_orig) * width for j in idx_human ]#(eye_x + 0.01) * width
        # y_max = [(data['annotations'][j]['bounding_box']['y']/height_orig + data['annotations'][j]['bounding_box']['h']/height_orig) * height for j in idx_human ] #(eye_y + 0.01) * height



                


        for i in range(len(data['annotations'])) :
            image_path = data['image']['filename']
            # print("image_path ::", image_path)
            image_path = os.path.join(self.root_dir,'images', image_path)

            # print("image_path :::", image_path)

            image_path = image_path.replace('\\', '/')

            img = Image.open(image_path)

            img = img.convert('RGB')
            # img.save("origin_img.jpg")
            width_orig, height_orig = img.size  # 1920,1080

            newsize = (1920, 1080)
            img = img.resize(newsize)
            width, height = img.size
            # print("width, height  ::", width, height )

            # print(data['annotations'][i]['name'] )

            ####


            # gaze_x, gaze_y = gaze
            # eye_x, eye_y = eye
            ####

            if data['annotations'][i]['name'] == "Gaze direction" :
                # print(data['annotations'][i])
                # print("path origin ::",data['annotations'][i]['line']['path'][0] )
                gaze_counter+=1


                #

                other_heads = []

                test_list = []
                #find participant/lecturer with this gaze start point --
                for jj in range(len(data['annotations'])) :
                        if data['annotations'][jj]['name'] == "Participants" or data['annotations'][jj]['name'] == "Lecturer" or data['annotations'][jj]['name'] == "Book/Paper" or data['annotations'][jj]['name'] == "Projector Screen" or data['annotations'][jj]['name'] == "Black/White Board" or data['annotations'][jj]['name'] == "Desktop Monitor" or data['annotations'][jj]['name'] == "Mobilephone"  or data['annotations'][jj]['name'] == "Laptop":
                            other_heads.append(map(float, [(data['annotations'][jj]['bounding_box']['x']/width_orig) * width, (data['annotations'][jj]['bounding_box']['y']/height_orig) * height,  (data['annotations'][jj]['bounding_box']['x']/width_orig + data['annotations'][jj]['bounding_box']['w']/width_orig) * width, (data['annotations'][jj]['bounding_box']['y']/height_orig + data['annotations'][jj]['bounding_box']['h']/height_orig) * height]))
                            test_list.append(1)
                        else:
                            other_heads.append('na')


                # print("other_heads list ::::::", other_heads)

                #find participant/lecturer with this gaze start point --
                for j in range(len(data['annotations'])) :
                     if data['annotations'][j]['name'] == "Participants" or data['annotations'][j]['name'] == "Lecturer":
                        head_counter +=1
                        if data['annotations'][i]['line']['path'][0]['x'] > data['annotations'][j]['bounding_box']['x'] and data['annotations'][i]['line']['path'][0]['x'] < data['annotations'][j]['bounding_box']['x'] + data['annotations'][j]['bounding_box']['w'] :
                            if data['annotations'][i]['line']['path'][0]['y'] > data['annotations'][j]['bounding_box']['y'] and data['annotations'][i]['line']['path'][0]['y'] < data['annotations'][j]['bounding_box']['y'] + data['annotations'][j]['bounding_box']['h'] :
                                

                                # print("other_heads size :", len(other_heads))
                                
                                concerned_index = j
                                # print("concerned_index :", concerned_index)
                                other_heads.pop(concerned_index)

                                # toremove_index = other_heads.index("na")

                                toremove_index = [r for r, x in enumerate(other_heads) if x == "na"]
                                # print("toremove_index = other_heads.index ::", toremove_index)

                                while len(toremove_index) > 0 :

                                    other_heads.pop(toremove_index[-1])
                                    toremove_index.pop(-1)

                                # print("other_heads list ::::::", other_heads)


                                # print("match found of gaze origin!!!!!!!!!")
                                gaze_head_counter +=1
                                other_heads_dupe = other_heads.copy()


                                eye = [float(data['annotations'][i]['line']['path'][0]['x'])/width_orig, float(data['annotations'][i]['line']['path'][0]['y'])/height_orig]
                                gaze = [float(data['annotations'][i]['line']['path'][1]['x'])/width_orig, float(data['annotations'][i]['line']['path'][1]['y'])/height_orig]

                                # print("eye :", eye)
                                # print("gaze :", gaze)


                                # #Get bounding boxes and class labels as well as gt index for gazed object
                                # gt_bboxes, gt_labels = np.zeros(1), np.zeros(1)
                                # gt_labels = np.expand_dims(gt_labels, axis=0)


                                gaze_x, gaze_y = gaze
                                eye_x, eye_y = eye


                                # k = 0.1
                                x_min = (data['annotations'][j]['bounding_box']['x']/width_orig) * width#(eye_x - 0.01) * width
                                y_min = (data['annotations'][j]['bounding_box']['y']/height_orig) * height#(eye_y - 0.01) * height
                                x_max = (data['annotations'][j]['bounding_box']['x']/width_orig + data['annotations'][j]['bounding_box']['w']/width_orig) * width#(eye_x + 0.01) * width
                                y_max = (data['annotations'][j]['bounding_box']['y']/height_orig + data['annotations'][j]['bounding_box']['h']/height_orig) * height #(eye_y + 0.01) * height
                                if x_min < 0:
                                    x_min = 0
                                if y_min < 0:
                                    y_min = 0
                                if x_max < 0:
                                    x_max = 0
                                if y_max < 0:
                                    y_max = 0
                                # x_min -= k * abs(x_max - x_min)
                                # y_min -= k * abs(y_max - y_min)
                                # x_max += k * abs(x_max - x_min)
                                # y_max += k * abs(y_max - y_min)
                                x_min, y_min, x_max, y_max = map(float, [x_min, y_min, x_max, y_max])


                                # print("x_min, y_min, x_max, y_max  :", x_min, y_min, x_max, y_max )


                                
                                if self.training == 'test':
                                    imsize = torch.IntTensor([width, height])

                                else :

                                    ## data augmentation

                                    # Jitter (expansion-only) bounding box size
                                    if np.random.random_sample() <= 0.5:
                                        k = np.random.random_sample() * 0.2
                                        x_min -= k * abs(x_max - x_min)
                                        y_min -= k * abs(y_max - y_min)
                                        x_max += k * abs(x_max - x_min)
                                        y_max += k * abs(y_max - y_min)

                                        for tt in range(len(other_heads)) :
                                            x_min_oh, y_min_oh, x_max_oh, y_max_oh = other_heads[tt]

                                            x_min_oh -= k * abs(x_max_oh - x_min_oh)
                                            y_min_oh -= k * abs(y_max_oh - y_min_oh)
                                            x_max_oh += k * abs(x_max_oh - x_min_oh)
                                            y_max_oh += k * abs(y_max_oh - y_min_oh)

                                            other_heads_dupe[tt] = map(float, [x_min_oh, y_min_oh, x_max_oh, y_max_oh]) 


                                    # Random Crop
                                    if np.random.random_sample() <= 0.5:
                                        # Calculate the minimum valid range of the crop that doesn't exclude the face and the gaze target
                                        crop_x_min = np.min([gaze_x * width, x_min, x_max])
                                        crop_y_min = np.min([gaze_y * height, y_min, y_max])
                                        crop_x_max = np.max([gaze_x * width, x_min, x_max])
                                        crop_y_max = np.max([gaze_y * height, y_min, y_max])

                                        # Randomly select a random top left corner
                                        if crop_x_min >= 0:
                                            crop_x_min = np.random.uniform(0, crop_x_min)
                                        if crop_y_min >= 0:
                                            crop_y_min = np.random.uniform(0, crop_y_min)

                                        # Find the range of valid crop width and height starting from the (crop_x_min, crop_y_min)
                                        crop_width_min = crop_x_max - crop_x_min
                                        crop_height_min = crop_y_max - crop_y_min
                                        crop_width_max = width - crop_x_min
                                        crop_height_max = height - crop_y_min
                                        # Randomly select a width and a height
                                        crop_width = np.random.uniform(crop_width_min, crop_width_max)
                                        crop_height = np.random.uniform(crop_height_min, crop_height_max)

                                        # Crop it
                                        img = TF.crop(img, crop_y_min, crop_x_min, crop_height, crop_width)

                                        # Record the crop's (x, y) offset
                                        offset_x, offset_y = crop_x_min, crop_y_min

                                        # convert coordinates into the cropped frame
                                        x_min, y_min, x_max, y_max = x_min - offset_x, y_min - offset_y, x_max - offset_x, y_max - offset_y


                                        for tt in range(len(other_heads_dupe)) :
                                            x_min_oh, y_min_oh, x_max_oh, y_max_oh = other_heads_dupe[tt]
                                            x_min_oh, y_min_oh, x_max_oh, y_max_oh =  x_min_oh- offset_x, y_min_oh- offset_y, x_max_oh - offset_x, y_max_oh- offset_y
                                            other_heads_dupe[tt] = map(float, [x_min_oh, y_min_oh, x_max_oh, y_max_oh]) 


                                        # if gaze_inside:
                                        gaze_x, gaze_y = (gaze_x * width - offset_x) / float(crop_width), \
                                                        (gaze_y * height - offset_y) / float(crop_height)
                                        # else:
                                        #     gaze_x = -1; gaze_y = -1

                                        width, height = crop_width, crop_height


                                    # Random flip
                                    if np.random.random_sample() <= 0.5:
                                        img = img.transpose(Image.FLIP_LEFT_RIGHT)
                                        x_max_2 = width - x_min
                                        x_min_2 = width - x_max
                                        x_max = x_max_2
                                        x_min = x_min_2
                                        gaze_x = 1 - gaze_x

                                        for tt in range(len(other_heads_dupe)) :
                                            x_min_oh, y_min_oh, x_max_oh, y_max_oh = other_heads_dupe[tt]

                                            x_max_2_oh = width - x_min_oh
                                            x_min_2_oh = width - x_max_oh
                                            x_max_oh = x_max_2_oh
                                            x_min_oh = x_min_2_oh
                                            other_heads_dupe[tt] = map(float, [x_min_oh, y_min_oh, x_max_oh, y_max_oh]) 


                                
                                    

                                    # Random color change
                                    if np.random.random_sample() <= 0.5:
                                        img = TF.adjust_brightness(img, brightness_factor=np.random.uniform(0.5, 1.5))
                                        img = TF.adjust_contrast(img, contrast_factor=np.random.uniform(0.5, 1.5))
                                        img = TF.adjust_saturation(img, saturation_factor=np.random.uniform(0, 1.5))

                                    # Random flip
                                    if np.random.random_sample() <= 0.5:
                                        img = img.transpose(Image.FLIP_LEFT_RIGHT)
                                        x_max_2 = width - x_min
                                        x_min_2 = width - x_max
                                        x_max = x_max_2
                                        x_min = x_min_2
                                        gaze_x = 1 - gaze_x

                                        for tt in range(len(other_heads_dupe)) :
                                            x_min_oh, y_min_oh, x_max_oh, y_max_oh = other_heads_dupe[tt]
                                            x_max_2_oh = width - x_min_oh
                                            x_min_2_oh = width - x_max_oh
                                            x_max_oh = x_max_2_oh
                                            x_min_oh = x_min_2_oh
                                            other_heads_dupe[tt] = map(float, [x_min_oh, y_min_oh, x_max_oh, y_max_oh]) 

                                    # Random color change
                                    if np.random.random_sample() <= 0.5:
                                        img = TF.adjust_brightness(img, brightness_factor=np.random.uniform(0.5, 1.5))
                                        img = TF.adjust_contrast(img, contrast_factor=np.random.uniform(0.5, 1.5))
                                        img = TF.adjust_saturation(img, saturation_factor=np.random.uniform(0, 1.5))


                    

                                

                                head_channel = chong_imutils.get_head_box_channel(x_min, y_min, x_max, y_max, width, height,
                                                                            resolution=self.input_size, coordconv=False).unsqueeze(0)


                                object_channel = chong_imutils.get_object_box_channel(other_heads_dupe, width, height,
                                                                            resolution=self.input_size, coordconv=False).unsqueeze(0)

                                # Crop the face
                                face = img.crop((int(x_min), int(y_min), int(x_max), int(y_max)))

                                im_np = np.asarray(face)
                                raw = np.asarray(img)
                     

                                # face = TF.crop(img, int(y_min), int(x_min), int(y_max)-int(y_min), int(x_max)-int(x_min))

                                # if self.imshow:
                                #     img.resize((224,224)).save("img_aug.jpg")
                                #     face.save('face_aug.jpg')

                                if self.transform is not None:
                                    img = self.transform(img)
                                    face = self.transform(face)

                                # cv2.imshow("resized image ", img)

                                # generate the heat map used for deconv prediction
                                gaze_heatmap = torch.zeros(self.output_size, self.output_size)  # set the size of the output
                                if self.training == 'test':  # aggregated heatmap
                                    gaze_heatmap = chong_imutils.draw_labelmap(gaze_heatmap, [gaze_x * self.output_size, gaze_y * self.output_size],
                                                                                3,
                                                                                type='Gaussian')

                                else:
                                    # if gaze_inside:
                                    gaze_heatmap = chong_imutils.draw_labelmap(gaze_heatmap, [gaze_x * self.output_size, gaze_y * self.output_size],
                                                                        3,
                                                                        type='Gaussian')

                                # return img, face, head_channel, gaze_heatmap, image_path, gaze_inside
                                if self.training == 'train':
                                    self.data_mat.append([img, face, head_channel, gaze_heatmap, object_channel, image_path, gaze_inside])

                                elif self.training == 'test':
                                    self.data_mat.append([img, face, head_channel, eye, gaze_heatmap, object_channel, gaze, gaze_inside, image_path])

                                
                                

                                cv2.imshow("face", im_np)
                                cv2.imshow("image", raw)
                                cv2.waitKey(1)
                                break
            # if gaze_head_counter == 5:
            #     break
        print("gaze direction line found :", gaze_counter)
        # print("heads found :", head_counter)
        print("heads and gaze matched :",gaze_head_counter )
        self.image_num += gaze_head_counter

        print("sample count :",self.image_num )


     


class GooDataset(Dataset):
    def __init__(self, root_dir, mat_file, training='train', include_path=False, input_size=224, output_size=64, imshow = False, use_gtbox=False):
        assert (training in set(['train', 'test']))
        self.root_dir = root_dir
        self.mat_file = mat_file
        self.training = training
        self.include_path = include_path
        self.input_size = input_size
        self.output_size = output_size
        self.imshow = imshow
        self.transform = _get_transform(input_size)
        self.use_gtbox= use_gtbox

        with open(mat_file, 'rb') as f:
            self.data = pickle.load(f)
            self.image_num = len(self.data)

        print("Number of Images:", self.image_num)
        logging.info('%s contains %d images' % (self.mat_file, self.image_num))


    def __len__(self):
        return self.image_num

    def __getitem__(self, idx):

        gaze_inside = True
        data = self.data[idx]
        # print(data)
        image_path = data['filename']
        image_path = os.path.join(self.root_dir, image_path)
        #print(image_path)

        eye = [float(data['hx'])/640, float(data['hy'])/480]
        gaze = [float(data['gaze_cx'])/640, float(data['gaze_cy'])/480]


        image_path = image_path.replace('\\', '/')
        img = Image.open(image_path)
        img = img.convert('RGB')
        width, height = img.size
        gaze_x, gaze_y = gaze
        eye_x, eye_y = eye

        #Get bounding boxes and class labels as well as gt index for gazed object
        gt_bboxes, gt_labels = np.zeros(1), np.zeros(1)
        gt_labels = np.expand_dims(gt_labels, axis=0)
        gaze_idx = np.copy(data['gazeIdx']).astype(np.int64) #index of gazed object
        gaze_class = np.copy(data['gaze_item']).astype(np.int64) #class of gazed object
        if self.use_gtbox:
            gt_bboxes = np.copy(data['ann']['bboxes']) / [640, 480, 640, 480]
            gt_labels = np.copy(data['ann']['labels'])

            gtbox = gt_bboxes[gaze_idx]
            

        k = 0.1
        x_min = (eye_x - 0.15) * width
        y_min = (eye_y - 0.15) * height
        x_max = (eye_x + 0.15) * width
        y_max = (eye_y + 0.15) * height
        if x_min < 0:
            x_min = 0
        if y_min < 0:
            y_min = 0
        if x_max < 0:
            x_max = 0
        if y_max < 0:
            y_max = 0
        x_min -= k * abs(x_max - x_min)
        y_min -= k * abs(y_max - y_min)
        x_max += k * abs(x_max - x_min)
        y_max += k * abs(y_max - y_min)
        x_min, y_min, x_max, y_max = map(float, [x_min, y_min, x_max, y_max])

        if self.imshow:
            img.save("origin_img.jpg")

        if self.training == 'test':
            imsize = torch.IntTensor([width, height])
        else:
            ## data augmentation

            # Jitter (expansion-only) bounding box size
            if np.random.random_sample() <= 0.5:
                k = np.random.random_sample() * 0.2
                x_min -= k * abs(x_max - x_min)
                y_min -= k * abs(y_max - y_min)
                x_max += k * abs(x_max - x_min)
                y_max += k * abs(y_max - y_min)

            # Random Crop
            if np.random.random_sample() <= 0.5:
                # Calculate the minimum valid range of the crop that doesn't exclude the face and the gaze target
                crop_x_min = np.min([gaze_x * width, x_min, x_max])
                crop_y_min = np.min([gaze_y * height, y_min, y_max])
                crop_x_max = np.max([gaze_x * width, x_min, x_max])
                crop_y_max = np.max([gaze_y * height, y_min, y_max])

                # Randomly select a random top left corner
                if crop_x_min >= 0:
                    crop_x_min = np.random.uniform(0, crop_x_min)
                if crop_y_min >= 0:
                    crop_y_min = np.random.uniform(0, crop_y_min)

                # Find the range of valid crop width and height starting from the (crop_x_min, crop_y_min)
                crop_width_min = crop_x_max - crop_x_min
                crop_height_min = crop_y_max - crop_y_min
                crop_width_max = width - crop_x_min
                crop_height_max = height - crop_y_min
                # Randomly select a width and a height
                crop_width = np.random.uniform(crop_width_min, crop_width_max)
                crop_height = np.random.uniform(crop_height_min, crop_height_max)

                # Crop it
                img = TF.crop(img, crop_y_min, crop_x_min, crop_height, crop_width)

                # Record the crop's (x, y) offset
                offset_x, offset_y = crop_x_min, crop_y_min

                # convert coordinates into the cropped frame
                x_min, y_min, x_max, y_max = x_min - offset_x, y_min - offset_y, x_max - offset_x, y_max - offset_y
                # if gaze_inside:
                gaze_x, gaze_y = (gaze_x * width - offset_x) / float(crop_width), \
                                 (gaze_y * height - offset_y) / float(crop_height)
                # else:
                #     gaze_x = -1; gaze_y = -1

                width, height = crop_width, crop_height

            # Random flip
            if np.random.random_sample() <= 0.5:
                img = img.transpose(Image.FLIP_LEFT_RIGHT)
                x_max_2 = width - x_min
                x_min_2 = width - x_max
                x_max = x_max_2
                x_min = x_min_2
                gaze_x = 1 - gaze_x

            # Random color change
            if np.random.random_sample() <= 0.5:
                img = TF.adjust_brightness(img, brightness_factor=np.random.uniform(0.5, 1.5))
                img = TF.adjust_contrast(img, contrast_factor=np.random.uniform(0.5, 1.5))
                img = TF.adjust_saturation(img, saturation_factor=np.random.uniform(0, 1.5))

            # Random flip
            if np.random.random_sample() <= 0.5:
                img = img.transpose(Image.FLIP_LEFT_RIGHT)
                x_max_2 = width - x_min
                x_min_2 = width - x_max
                x_max = x_max_2
                x_min = x_min_2
                gaze_x = 1 - gaze_x

            # Random color change
            if np.random.random_sample() <= 0.5:
                img = TF.adjust_brightness(img, brightness_factor=np.random.uniform(0.5, 1.5))
                img = TF.adjust_contrast(img, contrast_factor=np.random.uniform(0.5, 1.5))
                img = TF.adjust_saturation(img, saturation_factor=np.random.uniform(0, 1.5))
        # print('bbx2',  [x_min, y_min, x_max, y_max])

        head_channel = chong_imutils.get_head_box_channel(x_min, y_min, x_max, y_max, width, height,
                                                    resolution=self.input_size, coordconv=False).unsqueeze(0)

        # Crop the face
        face = img.crop((int(x_min), int(y_min), int(x_max), int(y_max)))

        if self.imshow:
            img.save("img_aug.jpg")
            face.save('face_aug.jpg')

        if self.transform is not None:
            img = self.transform(img)
            face = self.transform(face)

        # generate the heat map used for deconv prediction
        gaze_heatmap = torch.zeros(self.output_size, self.output_size)  # set the size of the output
        if self.training == 'test':  # aggregated heatmap
            gaze_heatmap = chong_imutils.draw_labelmap(gaze_heatmap, [gaze_x * self.output_size, gaze_y * self.output_size],
                                                         3,
                                                         type='Gaussian')

        else:
            # if gaze_inside:
            gaze_heatmap = chong_imutils.draw_labelmap(gaze_heatmap, [gaze_x * self.output_size, gaze_y * self.output_size],
                                                 3,
                                                 type='Gaussian')
        print(self.use_gtbox)
        if self.training == 'test' and self.use_gtbox:
            return img, face, head_channel, eye, gaze_heatmap, gaze, gaze_inside, image_path, gtbox
        elif self.training == 'test':
            return img, face, head_channel, eye, gaze_heatmap, gaze, gaze_inside, image_path
        else:
            return img, face, head_channel, gaze_heatmap, image_path, gaze_inside


class GazeDataset(Dataset):
    def __init__(self, root_dir, mat_file, training='train', input_size=224, output_size=64,  include_path=False, imshow = True):
        assert (training in set(['train', 'test']))
        self.root_dir = root_dir
        self.mat_file = mat_file
        self.training = training
        self.include_path = include_path

        if self.training == "test":
            anns = loadmat(self.mat_file)
            self.bboxes = anns[self.training + '_bbox']
            self.gazes = anns[self.training + '_gaze']
            self.paths = anns[self.training + '_path']
            self.eyes = anns[self.training + '_eyes']
            self.meta = anns[self.training + '_meta']
            self.image_num = self.paths.shape[0]

            logging.info('%s contains %d images' % (self.mat_file, self.image_num))
        else:
            csv_path = mat_file.split(".mat")[0]+".txt"
            #print('csv path', csv_path)
            column_names = ['path', 'idx', 'body_bbox_x', 'body_bbox_y', 'body_bbox_w', 'body_bbox_h', 'eye_x', 'eye_y',
                            'gaze_x', 'gaze_y',  'meta']
            df = pd.read_csv(csv_path, sep=',', names=column_names, index_col=False, encoding="utf-8-sig")
            # df = df[df['inout'] != -1]  # only use "in" or "out "gaze. (-1 is invalid, 0 is out gaze)
            #print('df', df.head())
            df.reset_index(inplace=True)
            self.y_train = df[['eye_x', 'eye_y', 'gaze_x',
                               'gaze_y']]
            self.X_train = df['path']
            self.image_num = len(df)

        self.input_size = input_size
        self.output_size = output_size
        self.imshow = imshow
        # logging.info('%s contains %d images' % (self.mat_file, self.image_num))
        self.transform = _get_transform(input_size)
    def __len__(self):
        return self.image_num

    def __getitem__(self, idx):

        if self.training == "test":
            # gaze_inside = True # always consider test samples as inside
            image_path = self.paths[idx][0][0]
            image_path = os.path.join(self.root_dir, image_path)
            eye = self.eyes[0, idx][0]
            # todo: process gaze differently for training or testing
            gaze = self.gazes[0, idx].mean(axis=0)
            gaze = gaze.tolist()
            eye = eye.tolist()
            # print('gaze', type(gaze), gaze)
            gaze_x, gaze_y = gaze
            image_path = image_path.replace('\\', '/')
            # image = cv2.imread(image_path, cv2.IMREAD_COLOR)
            eye_x, eye_y = eye
            # gaze_x, gaze_y = gaze
            gaze_inside = True # bool(inout)
        else:
            image_path = self.X_train.iloc[idx]
            eye_x, eye_y, gaze_x, gaze_y = self.y_train.iloc[idx]
            gaze_inside = True # bool(inout)

        image_path = os.path.join(self.root_dir, image_path)
        img = Image.open(image_path)
        img = img.convert('RGB')
        width, height = img.size

        # expand face bbox a bit
        k = 0.1
        x_min = (eye_x - 0.15) * width
        y_min = (eye_y - 0.15) * height
        x_max = (eye_x + 0.15) * width
        y_max = (eye_y + 0.15) * height
        if x_min < 0:
            x_min = 0
        if y_min < 0:
            y_min = 0
        if x_max < 0:
            x_max = 0
        if y_max < 0:
            y_max = 0
        x_min -= k * abs(x_max - x_min)
        y_min -= k * abs(y_max - y_min)
        x_max += k * abs(x_max - x_min)
        y_max += k * abs(y_max - y_min)
        x_min, y_min, x_max, y_max = map(float, [x_min, y_min, x_max, y_max])

        if self.imshow:
            img.save("origin_img.jpg")

        if self.training == 'test':
            imsize = torch.IntTensor([width, height])
        else:
            ## data augmentation

            # Jitter (expansion-only) bounding box size
            if np.random.random_sample() <= 0.5:
                k = np.random.random_sample() * 0.2
                x_min -= k * abs(x_max - x_min)
                y_min -= k * abs(y_max - y_min)
                x_max += k * abs(x_max - x_min)
                y_max += k * abs(y_max - y_min)

            # Random Crop
            if np.random.random_sample() <= 0.5:
                # Calculate the minimum valid range of the crop that doesn't exclude the face and the gaze target
                crop_x_min = np.min([gaze_x * width, x_min, x_max])
                crop_y_min = np.min([gaze_y * height, y_min, y_max])
                crop_x_max = np.max([gaze_x * width, x_min, x_max])
                crop_y_max = np.max([gaze_y * height, y_min, y_max])

                # Randomly select a random top left corner
                if crop_x_min >= 0:
                    crop_x_min = np.random.uniform(0, crop_x_min)
                if crop_y_min >= 0:
                    crop_y_min = np.random.uniform(0, crop_y_min)

                # Find the range of valid crop width and height starting from the (crop_x_min, crop_y_min)
                crop_width_min = crop_x_max - crop_x_min
                crop_height_min = crop_y_max - crop_y_min
                crop_width_max = width - crop_x_min
                crop_height_max = height - crop_y_min
                # Randomly select a width and a height
                crop_width = np.random.uniform(crop_width_min, crop_width_max)
                crop_height = np.random.uniform(crop_height_min, crop_height_max)

                # Crop it
                img = TF.crop(img, crop_y_min, crop_x_min, crop_height, crop_width)

                # Record the crop's (x, y) offset
                offset_x, offset_y = crop_x_min, crop_y_min

                # convert coordinates into the cropped frame
                x_min, y_min, x_max, y_max = x_min - offset_x, y_min - offset_y, x_max - offset_x, y_max - offset_y
                # if gaze_inside:
                gaze_x, gaze_y = (gaze_x * width - offset_x) / float(crop_width), \
                                 (gaze_y * height - offset_y) / float(crop_height)
                width, height = crop_width, crop_height

            # Random flip
            if np.random.random_sample() <= 0.5:
                img = img.transpose(Image.FLIP_LEFT_RIGHT)
                x_max_2 = width - x_min
                x_min_2 = width - x_max
                x_max = x_max_2
                x_min = x_min_2
                gaze_x = 1 - gaze_x

            # Random color change
            if np.random.random_sample() <= 0.5:
                img = TF.adjust_brightness(img, brightness_factor=np.random.uniform(0.5, 1.5))
                img = TF.adjust_contrast(img, contrast_factor=np.random.uniform(0.5, 1.5))
                img = TF.adjust_saturation(img, saturation_factor=np.random.uniform(0, 1.5))

        head_channel = chong_imutils.get_head_box_channel(x_min, y_min, x_max, y_max, width, height,
                                                    resolution=self.input_size, coordconv=False).unsqueeze(0)

        # Crop the face
        face = img.crop((int(x_min), int(y_min), int(x_max), int(y_max)))

        if self.imshow:
            img.save("img_aug.jpg")
            face.save('face_aug.jpg')

        if self.transform is not None:
            img = self.transform(img)
            face = self.transform(face)

        # generate the heat map used for deconv prediction
        gaze_heatmap = torch.zeros(self.output_size, self.output_size)  # set the size of the output

        if self.training == 'test':  # aggregated heatmap
            gaze_heatmap = chong_imutils.draw_labelmap(gaze_heatmap, [gaze_x * self.output_size, gaze_y * self.output_size],
                                                         3,
                                                         type='Gaussian')

        else:
            # if gaze_inside:
            gaze_heatmap = chong_imutils.draw_labelmap(gaze_heatmap, [gaze_x * self.output_size, gaze_y * self.output_size],
                                                 3,
                                                 type='Gaussian')
        # return
        if self.imshow:
            fig = plt.figure(111)
            img = 255 - chong_imutils.unnorm(img.numpy()) * 255
            img = np.clip(img, 0, 255)
            plt.imshow(np.transpose(img, (1, 2, 0)))
            plt.imshow(imresize(gaze_heatmap, (self.input_size, self.input_size)), cmap='jet', alpha=0.3)
            plt.imshow(imresize(1 - head_channel.squeeze(0), (self.input_size, self.input_size)), alpha=0.2)
            plt.savefig('viz_aug.png')

        if self.training == 'test':
            return img, face, head_channel, eye, gaze_heatmap, gaze, gaze_inside, image_path
        else:
            return img, face, head_channel, gaze_heatmap, image_path, gaze_inside


class GazeDatasetTxt(Dataset):
    def __init__(self, root_dir, mat_file, training='train', input_size=224, output_size=64,  include_path=False, imshow = False):
        assert (training in set(['train', 'test']))
        self.root_dir = root_dir
        self.mat_file = mat_file
        self.training = training
        self.include_path = include_path

        if self.training == "test":
            # anns = loadmat(self.mat_file)
            # self.bboxes = anns[self.training + '_bbox']
            # self.gazes = anns[self.training + '_gaze']
            # self.paths = anns[self.training + '_path']
            # self.eyes = anns[self.training + '_eyes']
            # self.meta = anns[self.training + '_meta']
            # self.image_num = self.paths.shape[0]
            csv_path = mat_file.split("s.mat")[0]+".txt"
            column_names = ['path', 'idx', 'body_bbox_x', 'body_bbox_y', 'body_bbox_w', 'body_bbox_h', 'eye_x', 'eye_y',
                            'gaze_x', 'gaze_y', 'bbox_x_min', 'bbox_y_min', 'bbox_x_max', 'bbox_y_max', 'meta']
            df = pd.read_csv(csv_path, sep=',', names=column_names, index_col=False, encoding="utf-8-sig")
            # df = df[['path', 'eye_x', 'eye_y', 'gaze_x', 'gaze_y', 'bbox_x_min', 'bbox_y_min', 'bbox_x_max',
            #         'bbox_y_max']].groupby(['path', 'eye_x'])
            # self.keys = list(df.groups.keys())
            df.reset_index(inplace=True)
            self.X_test = df['path']
            self.y_test = df[['eye_x', 'eye_y', 'gaze_x',
                               'gaze_y']]
            self.image_num = len(df)

            logging.info('%s contains %d images' % (self.mat_file, self.image_num))
        else:
            csv_path = mat_file.split(".mat")[0]+".txt"
            #print('csv path', csv_path)
            column_names = ['path', 'idx', 'body_bbox_x', 'body_bbox_y', 'body_bbox_w', 'body_bbox_h', 'eye_x', 'eye_y',
                            'gaze_x', 'gaze_y',  'meta']
            df = pd.read_csv(csv_path, sep=',', names=column_names, index_col=False, encoding="utf-8-sig")
            # df = df[df['inout'] != -1]  # only use "in" or "out "gaze. (-1 is invalid, 0 is out gaze)
            #print('df', df.head())
            df.reset_index(inplace=True)
            self.y_train = df[['eye_x', 'eye_y', 'gaze_x',
                               'gaze_y']]
            self.X_train = df['path']
            self.image_num = len(df)

        self.input_size = input_size
        self.output_size = output_size
        self.imshow = imshow
        # logging.info('%s contains %d images' % (self.mat_file, self.image_num))
        self.transform = _get_transform(input_size)
    def __len__(self):
        return self.image_num

    def __getitem__(self, idx):

        if self.training == "test":
            # gaze_inside = True # always consider test samples as inside
            # image_path = self.paths[idx][0][0]
            # image_path = os.path.join(self.root_dir, image_path)
            # eye = self.eyes[0, idx][0]
            # # todo: process gaze differently for training or testing
            # gaze = self.gazes[0, idx].mean(axis=0)
            # gaze = gaze.tolist()
            # eye = eye.tolist()
            # # print('gaze', type(gaze), gaze)
            # gaze_x, gaze_y = gaze
            # image_path = image_path.replace('\\', '/')
            # image = cv2.imread(image_path, cv2.IMREAD_COLOR)
            # eye_x, eye_y = eye
            # # gaze_x, gaze_y = gaze
            # gaze_inside = True # bool(inout)
            image_path = self.X_test.iloc[idx]
            eye_x, eye_y, gaze_x, gaze_y = self.y_test.iloc[idx]
            gaze_inside = True # bool(inout)
            eye = [eye_x, eye_y]
            gaze = [gaze_x, gaze_y]
        else:
            image_path = self.X_train.iloc[idx]
            eye_x, eye_y, gaze_x, gaze_y = self.y_train.iloc[idx]
            gaze_inside = True # bool(inout)

        image_path = os.path.join(self.root_dir, image_path)
        img = Image.open(image_path)
        img = img.convert('RGB')
        width, height = img.size

        # expand face bbox a bit
        k = 0.1
        x_min = (eye_x - 0.15) * width
        y_min = (eye_y - 0.15) * height
        x_max = (eye_x + 0.15) * width
        y_max = (eye_y + 0.15) * height
        if x_min < 0:
            x_min = 0
        if y_min < 0:
            y_min = 0
        if x_max < 0:
            x_max = 0
        if y_max < 0:
            y_max = 0
        x_min -= k * abs(x_max - x_min)
        y_min -= k * abs(y_max - y_min)
        x_max += k * abs(x_max - x_min)
        y_max += k * abs(y_max - y_min)
        x_min, y_min, x_max, y_max = map(float, [x_min, y_min, x_max, y_max])

        if self.imshow:
            img.save("origin_img.jpg")

        if self.training == 'test':
            imsize = torch.IntTensor([width, height])
        else:
            ## data augmentation

            # Jitter (expansion-only) bounding box size
            if np.random.random_sample() <= 0.5:
                k = np.random.random_sample() * 0.2
                x_min -= k * abs(x_max - x_min)
                y_min -= k * abs(y_max - y_min)
                x_max += k * abs(x_max - x_min)
                y_max += k * abs(y_max - y_min)

            # Random Crop
            if np.random.random_sample() <= 0.5:
                # Calculate the minimum valid range of the crop that doesn't exclude the face and the gaze target
                crop_x_min = np.min([gaze_x * width, x_min, x_max])
                crop_y_min = np.min([gaze_y * height, y_min, y_max])
                crop_x_max = np.max([gaze_x * width, x_min, x_max])
                crop_y_max = np.max([gaze_y * height, y_min, y_max])

                # Randomly select a random top left corner
                if crop_x_min >= 0:
                    crop_x_min = np.random.uniform(0, crop_x_min)
                if crop_y_min >= 0:
                    crop_y_min = np.random.uniform(0, crop_y_min)

                # Find the range of valid crop width and height starting from the (crop_x_min, crop_y_min)
                crop_width_min = crop_x_max - crop_x_min
                crop_height_min = crop_y_max - crop_y_min
                crop_width_max = width - crop_x_min
                crop_height_max = height - crop_y_min
                # Randomly select a width and a height
                crop_width = np.random.uniform(crop_width_min, crop_width_max)
                crop_height = np.random.uniform(crop_height_min, crop_height_max)

                # Crop it
                img = TF.crop(img, crop_y_min, crop_x_min, crop_height, crop_width)

                # Record the crop's (x, y) offset
                offset_x, offset_y = crop_x_min, crop_y_min

                # convert coordinates into the cropped frame
                x_min, y_min, x_max, y_max = x_min - offset_x, y_min - offset_y, x_max - offset_x, y_max - offset_y
                # if gaze_inside:
                gaze_x, gaze_y = (gaze_x * width - offset_x) / float(crop_width), \
                                 (gaze_y * height - offset_y) / float(crop_height)
                width, height = crop_width, crop_height

            # Random flip
            if np.random.random_sample() <= 0.5:
                img = img.transpose(Image.FLIP_LEFT_RIGHT)
                x_max_2 = width - x_min
                x_min_2 = width - x_max
                x_max = x_max_2
                x_min = x_min_2
                gaze_x = 1 - gaze_x

            # Random color change
            if np.random.random_sample() <= 0.5:
                img = TF.adjust_brightness(img, brightness_factor=np.random.uniform(0.5, 1.5))
                img = TF.adjust_contrast(img, contrast_factor=np.random.uniform(0.5, 1.5))
                img = TF.adjust_saturation(img, saturation_factor=np.random.uniform(0, 1.5))

        head_channel = chong_imutils.get_head_box_channel(x_min, y_min, x_max, y_max, width, height,
                                                    resolution=self.input_size, coordconv=False).unsqueeze(0)

        # Crop the face
        face = img.crop((int(x_min), int(y_min), int(x_max), int(y_max)))

        if self.imshow:
            img.save("img_aug.jpg")
            face.save('face_aug.jpg')

        if self.transform is not None:
            img = self.transform(img)
            face = self.transform(face)

        # generate the heat map used for deconv prediction
        gaze_heatmap = torch.zeros(self.output_size, self.output_size)  # set the size of the output

        if self.training == 'test':  # aggregated heatmap
            gaze_heatmap = chong_imutils.draw_labelmap(gaze_heatmap, [gaze_x * self.output_size, gaze_y * self.output_size],
                                                         3,
                                                         type='Gaussian')

        else:
            # if gaze_inside:
            gaze_heatmap = chong_imutils.draw_labelmap(gaze_heatmap, [gaze_x * self.output_size, gaze_y * self.output_size],
                                                 3,
                                                 type='Gaussian')
        # return
        if self.imshow:
            fig = plt.figure(111)
            img = 255 - chong_imutils.unnorm(img.numpy()) * 255
            img = np.clip(img, 0, 255)
            plt.imshow(np.transpose(img, (1, 2, 0)))
            plt.imshow(imresize(gaze_heatmap, (self.input_size, self.input_size)), cmap='jet', alpha=0.3)
            plt.imshow(imresize(1 - head_channel.squeeze(0), (self.input_size, self.input_size)), alpha=0.2)
            plt.savefig('viz_aug.png')

        if self.training == 'test':
            return img, face, head_channel, eye, gaze_heatmap, gaze, gaze_inside, image_path
        else:
            return img, face, head_channel, gaze_heatmap, image_path, gaze_inside


class GazeDatasetMat(Dataset):
    def __init__(self, root_dir, mat_file, training='train', input_size=224, output_size=64,  include_path=False, imshow = False):
        assert (training in set(['train', 'test']))
        self.root_dir = root_dir
        self.mat_file = mat_file
        self.training = training
        self.include_path = include_path

        anns = loadmat(self.mat_file)
        #print('anns keys', anns.keys())
        self.bboxes = anns[self.training + '_bbox']
        self.gazes = anns[self.training + '_gaze']
        self.paths = anns[self.training + '_path']
        self.eyes = anns[self.training + '_eyes']
        self.meta = anns[self.training + '_meta']
        self.image_num = self.paths.shape[0]

        self.input_size = input_size
        self.output_size = output_size
        self.imshow = imshow
        logging.info('%s contains %d images' % (self.mat_file, self.image_num))
        self.transform = _get_transform(input_size)
    def __len__(self):
        return self.image_num

    def __getitem__(self, idx):

        gaze_inside = True
        image_path = self.paths[idx][0][0]
        image_path = os.path.join(self.root_dir, image_path)
        img = Image.open(image_path)
        img = img.convert('RGB')
        width, height = img.size
        # print('imsize', img.size)
        # print('img path', image_path)

        box = self.bboxes[0, idx][0]
        eye = self.eyes[0, idx][0]
        # todo: process gaze differently for training or testing
        gaze = self.gazes[0, idx].mean(axis=0)
        # print("Gaze", gaze.shape, gaze)
        # image = cv2.imread(image_path, cv2.IMREAD_COLOR)

        # if random.random() > 0.5 and self.training == 'train':
        #     eye = [1.0 - eye[0], eye[1]]
        #     gaze = [1.0 - gaze[0], gaze[1]]
        #     image = cv2.flip(image, 1)
        gaze_x, gaze_y = gaze.tolist()
        eye_x, eye_y = eye.tolist()
        #print('gaze coords: ', type(gaze_x), type(gaze_y), gaze_x, gaze_y)
        #print('eye coords: ', type(eye_x), type(eye_y), eye_x, eye_y)

        # expand face bbox a bit
        k = 0.1
        x_min = (eye_x - 0.15) * width
        y_min = (eye_y - 0.15) * height
        x_max = (eye_x + 0.15) * width
        y_max = (eye_y + 0.15) * height
        if x_min < 0:
            x_min = 0
        if y_min < 0:
            y_min = 0
        if x_max < 0:
            x_max = 0
        if y_max < 0:
            y_max = 0
        x_min -= k * abs(x_max - x_min)
        y_min -= k * abs(y_max - y_min)
        x_max += k * abs(x_max - x_min)
        y_max += k * abs(y_max - y_min)
        x_min, y_min, x_max, y_max = map(float, [x_min, y_min, x_max, y_max])
        #print(x_min, y_min, x_max, y_max)
        if self.imshow:
            img.save("origin_img.jpg")

        if self.training == 'test':
            imsize = torch.IntTensor([width, height])
        else:
            ## data augmentation

            # Jitter (expansion-only) bounding box size
            if np.random.random_sample() <= 0.5:
                k = np.random.random_sample() * 0.2
                x_min -= k * abs(x_max - x_min)
                y_min -= k * abs(y_max - y_min)
                x_max += k * abs(x_max - x_min)
                y_max += k * abs(y_max - y_min)

            # Random Crop
            if np.random.random_sample() <= 0.5:
                # Calculate the minimum valid range of the crop that doesn't exclude the face and the gaze target
                crop_x_min = np.min([gaze_x * width, x_min, x_max])
                crop_y_min = np.min([gaze_y * height, y_min, y_max])
                crop_x_max = np.max([gaze_x * width, x_min, x_max])
                crop_y_max = np.max([gaze_y * height, y_min, y_max])

                # Randomly select a random top left corner
                if crop_x_min >= 0:
                    crop_x_min = np.random.uniform(0, crop_x_min)
                if crop_y_min >= 0:
                    crop_y_min = np.random.uniform(0, crop_y_min)

                # Find the range of valid crop width and height starting from the (crop_x_min, crop_y_min)
                crop_width_min = crop_x_max - crop_x_min
                crop_height_min = crop_y_max - crop_y_min
                crop_width_max = width - crop_x_min
                crop_height_max = height - crop_y_min
                # Randomly select a width and a height
                crop_width = np.random.uniform(crop_width_min, crop_width_max)
                crop_height = np.random.uniform(crop_height_min, crop_height_max)

                # Crop it
                img = TF.crop(img, crop_y_min, crop_x_min, crop_height, crop_width)

                # Record the crop's (x, y) offset
                offset_x, offset_y = crop_x_min, crop_y_min

                # convert coordinates into the cropped frame
                x_min, y_min, x_max, y_max = x_min - offset_x, y_min - offset_y, x_max - offset_x, y_max - offset_y
                # if gaze_inside:
                gaze_x, gaze_y = (gaze_x * width - offset_x) / float(crop_width), \
                                 (gaze_y * height - offset_y) / float(crop_height)
                # else:
                #     gaze_x = -1; gaze_y = -1

                width, height = crop_width, crop_height

            # Random flip
            if np.random.random_sample() <= 0.5:
                img = img.transpose(Image.FLIP_LEFT_RIGHT)
                x_max_2 = width - x_min
                x_min_2 = width - x_max
                x_max = x_max_2
                x_min = x_min_2
                gaze_x = 1 - gaze_x

            # Random color change
            if np.random.random_sample() <= 0.5:
                img = TF.adjust_brightness(img, brightness_factor=np.random.uniform(0.5, 1.5))
                img = TF.adjust_contrast(img, contrast_factor=np.random.uniform(0.5, 1.5))
                img = TF.adjust_saturation(img, saturation_factor=np.random.uniform(0, 1.5))
        # print('bbx2',  [x_min, y_min, x_max, y_max])

        head_channel = chong_imutils.get_head_box_channel(x_min, y_min, x_max, y_max, width, height,
                                                    resolution=self.input_size, coordconv=False).unsqueeze(0)

        # Crop the face
        face = img.crop((int(x_min), int(y_min), int(x_max), int(y_max)))

        if self.imshow:
            img.save("img_aug.jpg")
            face.save('face_aug.jpg')

        if self.transform is not None:
            img = self.transform(img)
            face = self.transform(face)
        #print('imsize2', img.size())
        # generate the heat map used for deconv prediction
        gaze_heatmap = torch.zeros(self.output_size, self.output_size)  # set the size of the output
        #print([gaze_x * self.output_size, gaze_y * self.output_size])
        #print(self.output_size)

        if self.training == 'test':  # aggregated heatmap
            gaze_heatmap = chong_imutils.draw_labelmap(gaze_heatmap, [gaze_x * self.output_size, gaze_y * self.output_size],
                                                         3,
                                                         type='Gaussian')

        else:
            # if gaze_inside:
            gaze_heatmap = chong_imutils.draw_labelmap(gaze_heatmap, [gaze_x * self.output_size, gaze_y * self.output_size],
                                                 3,
                                                 type='Gaussian')
        return
        if self.imshow:
            fig = plt.figure(111)
            img = 255 - chong_imutils.unnorm(img.numpy()) * 255
            img = np.clip(img, 0, 255)
            plt.imshow(np.transpose(img, (1, 2, 0)))
            plt.imshow(imresize(gaze_heatmap, (self.input_size, self.input_size)), cmap='jet', alpha=0.3)
            plt.imshow(imresize(1 - head_channel.squeeze(0), (self.input_size, self.input_size)), alpha=0.2)
            plt.savefig('viz_aug.png')

        if self.training == 'test':
            return img, face, head_channel, eye, gaze_heatmap, gaze, gaze_inside, image_path
        else:
            return img, face, head_channel, gaze_heatmap, image_path, gaze_inside
