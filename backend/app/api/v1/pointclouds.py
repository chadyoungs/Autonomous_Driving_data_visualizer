from app.services.dataset_factory import DatasetFactory
from app.utils.binary_serializer import BinarySerializer
from app.utils.pcd.pcd_processor import FlexiblePcdPipeline
from app.utils.pcd.pcd_utils import DistanceFilter, VoxelDownsampler
from fastapi import APIRouter, Query, Response

router = APIRouter()


@router.get("/{sample_token}/binary")
async def get_point_cloud_binary(sample_token: str, dataset_type: str = Query(None)):
    adapter = DatasetFactory.get_adapter(dataset_type)
    points = adapter.get_point_cloud(sample_token)

    fast_pipeline = FlexiblePcdPipeline()
    fast_pipeline.add_step(DistanceFilter(min_range=1.0, max_range=50.0))
    fast_pipeline.add_step(VoxelDownsampler(voxel_size=0.3))
    modified_points = fast_pipeline(points)

    binary_data = BinarySerializer.pack_point_cloud(modified_points)
    return Response(content=binary_data, media_type="application/octet-stream")
