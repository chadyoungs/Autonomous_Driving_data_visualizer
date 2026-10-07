from app.api.v1 import boxes, images, pointclouds, scenes
from fastapi import APIRouter

api_router = APIRouter()
api_router.include_router(scenes.router, prefix="/scenes", tags=["Scenes"])
api_router.include_router(pointclouds.router, prefix="/pointclouds", tags=["PointClouds"])
api_router.include_router(images.router, prefix="/images", tags=["Camera Images"])
api_router.include_router(boxes.router, prefix="/boxes", tags=["3D BoundingBoxes"])

# to do
# api_router.include_router(bev.router, prefix="/bev", tags=["BEV results"])
# api_router.include_router(can.router, prefix="/can", tags=["CAN bus data"])
