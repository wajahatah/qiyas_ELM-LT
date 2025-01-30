import pymongo
# from storage_utils import constant
import constants
class db_manager:
    def __init__(self):
        self.myclient = pymongo.MongoClient(constants.URL)
        self.mydb = self.myclient[constants.DB_NAME]
        self.alert =  self.mydb[constants.ALERT_COLLECTION] # Specific to data live data logging
        self.cam_collection = self.mydb[constants.CAMERA_COLLECTION]
        
    def insert_blobs(self,blobs):
        try:
            q = self.alert.insert_many(blobs)
            # print(q.acknowledged)
            return True
        except Exception as e :
            print(e)
            return False
        
    def insert_blob(self,blob):
        try:
            q = self.alert.insert_one(blob)
            # print(q.acknowledged)
            return True
        except Exception as e :
            print(e)
            return False
    
    def get_cam_attributes(self,camera_id):
        try:
            data = list(self.cam_collection.find({'_id':f'{camera_id}'}))
            data_dict = dict(data[0])
            # print(data_dict['_id'])
            # print(data_dict['url'])
            # print(data_dict['data'])
            return data_dict['url'], data_dict['data'], data_dict['i_angle'],data_dict['e_angle']
        except:
            print("Error or Data not found")
            return False
    
    def get_ids(self):
        try:
            ids = [doc["_id"] for doc in self.cam_collection.find({}, {"_id": 1})]
            print(ids)
            return ids
        except:
            return False
