import cv2
import base64
import json
import os
# from sos import sort_files_by_creation_time
import time

def start_processing_stream(camera):
    while True:
        image_path = data["data"]["camera_path"]
        frame = cv2.imread( image_path,cv2.IMREAD_COLOR)
        _,frame_encoded = cv2.imencode(".jpg", frame)
        frame_base64 = base64.b64encode(frame_encoded).decode('utf-8')
        response_content = (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + frame_base64.encode('utf-8') + b"\r\n\r\n"
            b"--frame\r\n"
            b"Content-Type: application/json\r\n\r\n" + json.dumps(data["data"]).encode('utf-8') + b"\r\n\r\n"
        )
        yield response_content
