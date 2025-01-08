import pymongo
from resources import constant
import cv2
import base64
import json
from pathlib import Path

class db_manager:
    def __init__(self):
        self.myclient = pymongo.MongoClient(constant.URL)
        self.mydb = self.myclient[constant.DB_NAME]
        self.mycol =  self.mydb[constant.COLLECTION_NAME]
    
    def get_image(self,alert_ID):
        object = list(self.mycol.find({'alert_ID':f'{alert_ID}'}))
        if object and Path(object[0]['image']).exists():
            frame = cv2.imread(object[0]['image'])
            _,frame_encoded = cv2.imencode(".jpg", frame)
            frame_base64 = base64.b64encode(frame_encoded).decode('utf-8')
            frame_base64 = frame_base64.encode('utf-8')
            data = {
                "success" : True,
                "image": frame_base64
            }
            return data
            
        else:
            return []


    def get_alert_dates(self):
        dates = list(self.mycol.distinct('date'))
        if dates:
            data = {"success": True, "data": dates}
            return data

    def get_chart_alerts(self, date):
        object = list(self.mycol.find({'date': f'{date}'}))
        data = []
        if object:
            for i in range(len(object)):
                temp_obj = {
                    "cam_id": object[i]['cam_id'],
                    "alert_ID": object[i]['alert_ID'],
                    "date": object[i]['date'],
                    "time": object[i]['time'],
                    "alert_title": object[i]['alerts'][0]['title'],
                    "candidate": object[i]['alerts'][0]['candidate'],
                    "image": object[i]['image']
                }
                data.append(temp_obj)

            return {"success": True, "data": data}
        else:
            return data


manager = db_manager()


