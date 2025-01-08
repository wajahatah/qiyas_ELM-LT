import numpy as np
import cv2
import matplotlib.pyplot as plt
from matplotlib.backends.backend_qtagg import (FigureCanvas)
from heatmappy import Heatmapper
from PIL import Image
# import datetime as dt

# x_axis_range_in_graph = 80

# x_range = [0, x_axis_range_in_graph] 
# # y_range = [0, 100]
# # xs = list(range(0, 200))
# # ys = [0] * x_len
# # ax.set_ylim(y_range)
# ax.set_xlim(x_range)
# ax.set_xlabel('x-axis', fontsize = 18)
# ax.set_ylabel('y-axis', fontsize = 18)
# plt.title('Attention over Time',fontsize=20)
# plt.ylabel('Attention Score')
# plt.xlabel('Time')

# plt.xticks(rotation=90, ha='right')
# plt.subplots_adjust(bottom=0.30)

# heatmapper = Heatmapper(opacity=0.5, point_strength=0.2, colours='default')



class Visualizer(object):

    def __init__(self) :

        self.x_axis_range_in_graph = 80

        self.x_range = [0, self.x_axis_range_in_graph] 

        self.fig = plt.figure()
        self.ax = self.fig.add_subplot(1, 1, 1)
        self.fig.set_figwidth(15)

        self.ax.set_xlim(self.x_range)
        self.ax.set_xlabel('x-axis', fontsize = 18)
        self.ax.set_ylabel('y-axis', fontsize = 18)

        plt.title('Attention over Time',fontsize=20)
        plt.ylabel('Impression Count')
        plt.xlabel('Time')

        plt.xticks(rotation=90, ha='right')
        plt.subplots_adjust(bottom=0.30)

        self.heatmapper = Heatmapper(opacity=0.5, point_strength=0.2, colours='default')

        self.colors = ['blue', 'orange', 'green', 'yellow']
        self.run_once = True
        self.update_canvas = False
        self.graph_image = None

       


    def graphics_overlay(self,frame, heatmap):

        frame_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
        heatmap_image = self.heatmapper.heatmap_on_img(heatmap, frame_pil)
        open_cv_image = np.array(heatmap_image) 
        open_cv_image = cv2.cvtColor(open_cv_image, cv2.COLOR_BGRA2BGR)
        open_cv_image = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2RGB)
     

        return open_cv_image



            


    def graph_overlay(self,frame,impression_list, graph_update_counter):




        # if frame.shape[0] == 720:

        if graph_update_counter == 0 :
            self.update_canvas = False

            if len(impression_list["time"]) > 0 :
                idx = range(len(impression_list["time"]))
                xnew = np.linspace(min(idx), max(idx), len(impression_list["time"]))

                impression_cat = []
                color = []

                for val in self.colors :
                    color.append(val)
                index = 0
                for val in impression_list.keys() :
                    if val != "time" :
                        impression_cat.append(impression_list[val])
                        if self.run_once :
                            plt.plot([], [], color =color[index], label =val)
                            index+=1
                self.run_once = False
            


                plt.stackplot(xnew, impression_cat, baseline ='zero', colors =color)
                plt.legend()
                plt.xticks(idx, impression_list["time"])

        if self.update_canvas == False :
            print("grapgh image is updated .........")
            canvas = FigureCanvas(self.fig)
            canvas.draw()
            # convert canvas to image
            self.graph_image = np.array(self.fig.canvas.get_renderer()._renderer)
            # it still is rgb, convert to opencv's default bgr
            self.graph_image = cv2.cvtColor(self.graph_image,cv2.COLOR_RGB2BGR)
            self.update_canvas = True

        print("self.update_canvas :::", self.update_canvas)
        open_cv_image = cv2.resize(frame,(1500,1070))
        v_concat_img = cv2.vconcat([self.graph_image, open_cv_image])

        return v_concat_img
