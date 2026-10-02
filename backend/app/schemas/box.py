from typing import List

from pydantic import BaseModel


class BoundingBox3D(BaseModel):
    token: str
    sample_annotation_token: str | None = None
    category_name: str
    translation: List[float]  # [x, y, z]
    size: List[float]  # [width, length, height]
    rotation: List[float]  # [w, x, y, z] quaternion
    num_lidar_pts: int = 0


# to do!
class FrameAnnotation(BaseModel):
    sample_token: str
    boxes: List[BoundingBox3D]
