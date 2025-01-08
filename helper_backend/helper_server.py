from mangum import Mangum
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from routing.router import root_router
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def http_exception_handler(request, exc: Exception):
    # logger.error(f'Http Exception Handler: {exc}')
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=dict(detail=dict(message="Internal Server Error")),
    )

app.include_router(root_router)

handler = Mangum(app, lifespan="off")
