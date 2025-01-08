from storage_utils.db_manager import db_manager
import time
import os
import cv2

def storage_process(queue):
    print("Process Created and running")
    mydbm = db_manager()
    if not os.path.exists("images"):
        os.makedirs("images")
    while True:
        try:
            item = queue.get()
            if item is None:
                break
            if item:
                frame = item['frame']
                data = item['alert']
                temp = {}
                array = []
                for i in data[0]:
                    t = {
                        "candidate": i,
                        "title": data[0][i]['alert_title']
                    }
                    # print("temp: ",t)
                    array.append(t)
                    temp["alert_ID"] = data[0][i]['id']
                    sp = temp['alert_ID'].split(' ')
                    temp['date'] = sp[0]
                    temp['time'] = sp[1]
                temp['cam_id'] = item['cam_id']
                temp['alerts'] = array
                file_path = os.getcwd() + "/images/" + str(time.time()) + '.jpg'
                cv2.imwrite(file_path,frame)
                temp['image'] = file_path
                mydbm.insert_blob(temp)
        except:
            time.sleep(0.1)
            continue
