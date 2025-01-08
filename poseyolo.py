"""from ultralytics import YOLO
import os
os.environ["KMP_DUPLICATE_LIB_OK"]="TRUE"
import time
import cv2

class ypose:
    def __init__(self, verbose=True):
    # Load the YOLO model
        self.model = YOLO("models_1/best_y11.pt")
        self.model.to('cuda')
        self.verbose = verbose 

    def pose(self,pf, head_bbox):
        frame = pf
        results = self.model(pf)
        mydict = {}
        # Iterate over each detected person and print their keypoints
        for result in results:
            keypoints = result.keypoints  # Get keypoints as a numpy array or tensor
            if keypoints is not None and keypoints.data.shape[1]>0: 
                keypoints_data=keypoints.data
                for person_idx, person_keypoints in enumerate(keypoints_data):
                    #Uncomment the following lines for key point visualization
                    for kp in person_keypoints:
                        x, y, confidence = kp
                        if confidence > 0.5:  # Optional: Only draw keypoints with sufficient confidence
                            # cv2.circle(frame, (int(x), int(y)), 3, (0, 255, 0), -1)  # Draw the keypoint
                            cv2.drawMarker(frame, (int(x), int(y)), (0, 0, 255), markerType=cv2.MARKER_STAR, markerSize=10, thickness=2)

                    # print("person", person_keypoints, "type", type(person_keypoints))
                    C = person_keypoints[0]  # Keypoint 0
                    A = person_keypoints[2]  # Keypoint 2
                    B = person_keypoints[3]  # Keypoint 3

                    Cx=int(C[0].item())
                    Cy=int(C[1].item())
                    Ax=A[0].item() 
                    Ay=A[1].item()
                    Bx=B[0].item()
                    By=B[1].item()

                    for key, value in head_bbox.items():
                        if (value[0] < Cx < value[2]) and (value[1]<Cy<value[3]):
                            id = key
#                    if head_bbox.get(1)[0] < Cx < head_bbox.get(1)[2]: id = 1
                            mydict[id] = {'Ax': Ax, 'Ay': Ay, 'Bx':Bx, 'By':By, 'Cx':Cx, 'Cy':Cy}
                            # print("Id assigned:",id,key)
                            break
                    
        return mydict


"""

# from ultralytics import YOLO
# import os
# os.environ["KMP_DUPLICATE_LIB_OK"]="TRUE"

# model = YOLO("C:/OsamaEjaz/Qiyas_Gaze_Estimation/Wajahat_Yolo_keypoint/runs/pose/trail4/weights/best_y11.pt")
# print("model-loaded")


from ultralytics import YOLO
import os
os.environ["KMP_DUPLICATE_LIB_OK"]="TRUE"
import time
import cv2
# import csv

dict1 = { 'xmin':30,'ymin':90,'xmax':367,'ymax':580}
dict2 = { 'xmin':370,'ymin':90,'xmax':730,'ymax':580}
dict3 = { 'xmin':740,'ymin':90,'xmax':1075,'ymax':580}
dict4 = { 'xmin':1080,'ymin':90,'xmax':1280,'ymax':580}
# global frame_count 

class ypose:
    def __init__(self, verbose=True):
    # Load the YOLO model
        self.model = YOLO("models_1/best_v11_2.pt")
        self.model.to('cuda')
        self.verbose = verbose 
        # self.frame_count = 0
        # self.output_folder = "C:/OsamaEjaz/Qiyas_Gaze_Estimation/Wajahat_Yolo_keypoint/frames_output/video2"#"frames_output/video1"
        # os.makedirs(self.output_folder, exist_ok=True)
        # self.csv_file_path = os.path.join(self.output_folder, "video2_output.csv")

        # # Create the CSV file with headers
        # headers = ["Frame Name"] + [f"person{i}{chr(k)}" for i in range(1, 5) for k in range(ord('a'), ord('j') + 1)]
        # with open(self.csv_file_path, mode='w', newline='') as csv_file:
        #     writer = csv.writer(csv_file)
        #     writer.writerow(headers)

    def pose(self,pf,head_bbox):
        # frame_name= f"frame_{self.frame_count:04d}"
        # self.frame_count += 1

        frame = pf
        results = self.model(pf)
        mydict = {}

        # csv_row = [frame_name]
        # person_columns= [[] for _ in range(5)]

        # Iterate over each detected person and print their keypoints
        for result in results:
            keypoints = result.keypoints  # Get keypoints as a numpy array or tensor
            if keypoints is not None and keypoints.data.shape[1]>0: 
                keypoints_data=keypoints.data
                for person_idx, person_keypoints in enumerate(keypoints_data):
                    #Uncomment the following lines for key point visualization
                    for kp in person_keypoints:
                        # x, y, confidence = kp
                        x, y, confidence = kp[0].item(), kp[1].item(), kp[2].item()
                        # if confidence > 0.5:  # Optional: Only draw keypoints with sufficient confidence
                        cv2.circle(frame, (int(x), int(y)), 2, (0, 255, 0), -1)  # Draw the keypoint
                            # cv2.drawMarker(frame, (int(x), int(y)), (0, 0, 255), markerType=cv2.MARKER_STAR, markerSize=10, thickness=2)
                            # cv2.putText(
                            #     frame,
                            #     f"({int(x)}, {int(y)})",
                            #     (int(x) + 5, int(y) - 5),
                            #     cv2.FONT_HERSHEY_SIMPLEX,
                            #     0.4,
                            #     (255, 0, 0),
                            #     1
                            # )
                    # print("person", person_keypoints, "type", type(person_keypoints))
                    C = person_keypoints[0]  # Keypoint 0
                    A = person_keypoints[1]  # Keypoint 2
                    B = person_keypoints[2]  # Keypoint 3

                    Cx=int(C[0].item())
                    Cy=int(C[1].item())
                    Ax=int(A[0].item()) 
                    Ay=int(A[1].item())
                    Bx=int(B[0].item())
                    By=int(B[1].item())

                    for key, value in head_bbox.items():
                        if (value[0] < Cx < value[2]) and (value[1]<Cy<value[3]):
                            id = key
                            mydict[id] = {'Ax': Ax, 'Ay': Ay, 'Bx':Bx, 'By':By, 'Cx':Cx, 'Cy':Cy}
                                #    if head_bbox.get(1)[0] < Cx < head_bbox.get(1)[2]: id = 1
                        # if (value[0] < x < value[2]) and (value[1] < y < value[3]):
                            # person_columns[int(key)].append(f"({int(x)}, {int(y)})")

                            # print("Id assigned:",id,key)
                            break
                        
        return mydict
        """
        # Fill the CSV row with detected keypoints in respective columns
        for person_data in person_columns:
            # csv_row.extend(person_data + ["0"] * (9 - len(person_data)))

            csv_row.extend(person_data)
            # # Fill missing keypoints with "N/A" to maintain the format
            # csv_row.extend(["0"] * (9 - len(person_data)))

        # Write the row to the CSV
        with open(self.csv_file_path, mode='a', newline='') as csv_file:
            writer = csv.writer(csv_file)
            writer.writerow(csv_row)

        # Save the frame with keypoints drawn
        frame_output_path = os.path.join(self.output_folder, f"{frame_name}.png")
        cv2.imwrite(frame_output_path, frame)

        # Show saved frame and CSV row
        # print(f"Frame saved: {frame_output_path}")
        # print(f"CSV row saved: {csv_row}")

        # frame_count += 1  # Increment frame counter
                    # if dict1['xmin'] < Cx < dict1['xmax']: id = 1
                    # if dict2['xmin'] < Cx < dict2['xmax']: id = 2
                    # if dict3['xmin'] < Cx < dict3['xmax']: id = 3
                    # if dict4['xmin'] < Cx < dict4['xmax']: id = 4

                    # mydict[id] = {'Ax': Ax, 'Ay': Ay, 'Bx':Bx, 'By':By, 'Cx':Cx, 'Cy':Cy}
    """
        # return print("csv is completed")




# from ultralytics import YOLO
# import os
# os.environ["KMP_DUPLICATE_LIB_OK"]="TRUE"

# model = YOLO("C:/OsamaEjaz/Qiyas_Gaze_Estimation/Wajahat_Yolo_keypoint/runs/pose/trail4/weights/best_y11.pt")
# print("model-loaded")