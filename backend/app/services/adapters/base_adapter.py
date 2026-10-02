from abc import ABC, abstractmethod
from typing import Any, Dict, List

import numpy as np
from app.schemas.box import BoundingBox3D


class BaseDatasetAdapter(ABC):

    @abstractmethod
    def get_scenes(self) -> List[Dict[str, Any]]:
        """get all scenes metadata"""
        pass

    @abstractmethod
    def get_frame_samples(self, scene_id: str) -> List[Dict[str, Any]]:
        """get all frame metadata within a scene"""
        pass

    @abstractmethod
    def get_point_cloud(self, sample_token: str) -> np.ndarray:
        """get the raw point cloud data (N, 4) -> [x, y, z, intensity]"""
        pass

    @abstractmethod
    def get_bounding_boxes(self, sample_token: str) -> List[BoundingBox3D]:
        """get the 3D bounding boxes for the current frame, converted to a standard format"""
        pass

    @abstractmethod
    def get_camera_image_filepath(self, sample_token: str, cam_name: str) -> str:
        """get the relative path or URL for the current frame's specific camera view"""
        pass
