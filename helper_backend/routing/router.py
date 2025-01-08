from fastapi import APIRouter, Request
from fastapi.responses import FileResponse
from resources.db_helper import manager

# from send_data import send_data
root_router = APIRouter(prefix=f'/stream')
@root_router.get("/version", tags=["root"])
def version():
    return {"message": 'crowd_counter_0.1'}

@root_router.get("/health", tags=["root"])
def health( request: Request):
    return {"message": "Healthy!"}


@root_router.get("/get_image", tags=["DB Function"])
async def get_image(alert_ID):
    data = manager.get_image(alert_ID)
    if not data:
        return {"success":False, "Message":f"No alert image found for the ID:{alert_ID}"}
    return data


@root_router.get("/get_alert_dates", tags=["DB Function"])
async def get_alert_dates():
    data = manager.get_alert_dates()
    if not data:
        return {"success":False}
    return data


@root_router.get("/get_chart_alerts", tags=["DB Function"])
async def get_chart_alerts(date):
    print("date:", date)
    data = manager.get_chart_alerts(date)
    print(data)
    if not data:
        return {"success":False, "Message":f"No data found for date:{date}"}
    return data
