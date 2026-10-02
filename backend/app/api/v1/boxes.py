from typing import List

from app.schemas.box import BoundingBox3D
from app.services.dataset_factory import DatasetFactory
from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/{sample_token}", response_model=List[BoundingBox3D])
async def get_boxes(sample_token: str, dataset_type: str = Query(None)):
    adapter = DatasetFactory.get_adapter(dataset_type)
    return adapter.get_bounding_boxes(sample_token)
