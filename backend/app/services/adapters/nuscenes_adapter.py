import os
from functools import lru_cache
from typing import Any, Dict, List

import numpy as np
from app.core.exceptions import (
    CameraFileNotFoundError,
    DatasetNotFoundError,
    PcdFileNotFoundError,
    SceneNotFoundError,
)
from app.schemas.box import BoundingBox3D
from app.services.adapters.base_adapter import BaseDatasetAdapter
from config import settings
from nuscenes.nuscenes import NuScenes


class NuScenesAdapter(BaseDatasetAdapter):
    def __init__(self):
        if not os.path.isdir(settings.NUSCENES_DATA_DIR):
            raise DatasetNotFoundError(dataset_type="nuscenes")

        self.nusc = NuScenes(
            version=settings.NUSCENES_VERSION,
            dataroot=settings.NUSCENES_DATA_DIR,
            verbose=False,
        )
        self.scene_name_map = {scene["name"]: scene for scene in self.nusc.scene}

    def get_scenes(self) -> List[Dict[str, Any]]:
        return [
            {
                "scene_id": scene["token"],
                "name": scene["name"],
                "description": scene["description"],
                "nbr_samples": scene["nbr_samples"],
                "first_sample_token": scene["first_sample_token"],
            }
            for scene in self.nusc.scene
        ]

    def get_scene_description(self, scene_name: str) -> str:
        scene_rec = self.scene_name_map.get(scene_name)
        if scene_rec is None:
            raise SceneNotFoundError(scene_name=scene_name)
        return scene_rec["description"]

    def get_frame_samples(self, scene_name: str) -> List[Dict[str, Any]]:
        scene_rec = None

        scene_rec = self.scene_name_map.get(scene_name)
        if scene_rec is None:
            raise SceneNotFoundError(scene_name=scene_name)

        sample_list = []
        current_token = scene_rec["first_sample_token"]
        while current_token != "":
            sample = self.nusc.get("sample", current_token)
            sample_list.append({"sample_token": sample["token"], "timestamp": sample["timestamp"]})
            current_token = sample["next"]

        return {
            "scene_name": scene_name,
            "total_frames": len(sample_list),
            "samples": sample_list,
        }

    @lru_cache(maxsize=settings.CACHE_MAX_SIZE)
    def get_point_cloud(self, sample_token: str) -> np.ndarray:
        sample = self.nusc.get("sample", sample_token)
        lidar_token = sample["data"]["LIDAR_TOP"]
        pcl_path = self.nusc.get_sample_data_path(lidar_token)

        if not os.path.exists(pcl_path):
            raise PcdFileNotFoundError(f"Point cloud file not found: {pcl_path}")

        raw_points = np.fromfile(pcl_path, dtype=np.float32).reshape(-1, 5)
        return raw_points[:, :4]

    def get_camera_image_filepath(self, sample_token: str, cam_name: str):
        sample = self.nusc.get("sample", sample_token)

        cam_token = sample["data"][cam_name]
        sd_record = self.nusc.get("sample_data", cam_token)

        img_full_path = os.path.join(self.nusc.dataroot, sd_record["filename"])

        if not os.path.exists(img_full_path):
            raise CameraFileNotFoundError(sample_token=sample_token, cam_name=cam_name)

        return img_full_path

    def get_bounding_boxes(self, sample_token: str) -> List[BoundingBox3D]:
        sample = self.nusc.get("sample", sample_token)
        lidar_token = sample["data"]["LIDAR_TOP"]
        _, boxes, _ = self.nusc.get_sample_data(lidar_token)

        result = []
        for box in boxes:
            result.append(
                BoundingBox3D(
                    token=box.token,
                    sample_annotation_token=getattr(box, "sample_annotation_token", None),
                    category_name=box.name,
                    translation=box.center.tolist(),
                    size=box.wlh.tolist(),
                    rotation=box.orientation.elements.tolist(),
                    num_lidar_pts=getattr(box, "num_lidar_pts", 0),
                )
            )
        return result
