import os
from typing import Dict

from app.services.dataset_factory import DatasetFactory
from fastapi import APIRouter, Query, Response

router = APIRouter()


@router.get("/{sample_token}/{cam_name}")
def get_camera_image(sample_token: str, cam_name: str, dataset_type: str = Query(None)):
    adapter = DatasetFactory.get_adapter(dataset_type)

    img_path = adapter.get_camera_image_filepath(sample_token, cam_name)
    if not os.path.exists(img_path):
        return Response(status_code=404, content="image file not found")

    with open(img_path, "rb") as f:
        img_bytes = f.read()
    return Response(content=img_bytes, media_type="image/jpeg")
