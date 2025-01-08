from fastapi import APIRouter, Request, BackgroundTasks
from wrapper import Stream
from starlette.responses import StreamingResponse
from storage_utils.db_manager import db_manager

db = db_manager()

# from send_data import send_data
root_router = APIRouter(prefix=f'/stream')
@root_router.get("/version", tags=["root"])
def version():
    return {"message": 'crowd_counter_0.1'}

@root_router.get("/health", tags=["root"])
def health( request: Request):
    return {"message": "Healthy!"}

@root_router.on_event("shutdown")
def shutdown_event():
    print("shutting Down")
    Stream.empty_queue()
    Stream.quit_flag.value = True
    Stream.video_queue.put(None)
    Stream.storage_queue.put(None)

    

def api_termination():
    print("Stop Called")
    Stream.video_loader_flag.value = True
    # Stream.empty_queue()
    

@root_router.get("/video_feed",
    tags=["stream processing"]
)
async def process_stream(camera_id, background_tasks: BackgroundTasks):
    # print(f"Video name received: {video_name}")
    print(f"camera_id received: {camera_id}")
    background_tasks.add_task(api_termination)
    api_termination()
    return StreamingResponse(
        content = Stream.infer(camera_id),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )

@root_router.get("/get_ids", tags=["root"])
async def get_ids():
    data = db.get_ids()
    if data:
        return {"ids": data, "success": True}
    else:
        return {"success": False}
    

@root_router.get("/change_config", tags=["root"])
async def change_config(desk_roi_drawing,objects_drawing,head_bbox_drawing,desk_number_drawing,visual_field_drawing,gaze,heat_map):
    Stream.change_config(desk_roi_drawing,objects_drawing,head_bbox_drawing,desk_number_drawing,visual_field_drawing,gaze,heat_map)
    return {"success": True}

@root_router.get("/get_config", tags=["root"])
async def get_config():
    data = {
        "desk_roi_drawing": Stream.config_dict.get("desk_roi_drawing"),
        "objects_drawing": Stream.config_dict.get("objects_drawing"),
        "head_bbox_drawing": Stream.config_dict.get("head_bbox_drawing"),
        "desk_number_drawing": Stream.config_dict.get("desk_number_drawing"),
        "visual_field_drawing" : Stream.config_dict.get("visual_field_drawing"),
        "gaze" : Stream.config_dict.get("gaze"),
        "heat_map" : Stream.config_dict.get("heat_map"),
    }
    return {"config": data,"success": True}

