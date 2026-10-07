from app.services.dataset_factory import DatasetFactory
from fastapi import APIRouter, Query

router = APIRouter()


@router.get("/")
async def get_scenes(dataset_type: str = Query(None)):
    adapter = DatasetFactory.get_adapter(dataset_type)
    return adapter.get_scenes()


@router.get("/{scene_name}/description")
async def get_scene_description(scene_name: str, dataset_type: str = Query(None)):
    adapter = DatasetFactory.get_adapter(dataset_type)
    return adapter.get_scene_description(scene_name)


@router.get("/{scene_name}/samples")
async def get_scene_samples(scene_name: str, dataset_type: str = Query(None)):
    adapter = DatasetFactory.get_adapter(dataset_type)
    return adapter.get_frame_samples(scene_name)
