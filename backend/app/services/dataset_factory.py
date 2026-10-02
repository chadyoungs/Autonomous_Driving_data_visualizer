from app.services.adapters.base_adapter import BaseDatasetAdapter
from app.services.adapters.nuscenes_adapter import NuScenesAdapter
from config import settings


class DatasetFactory:
    _adapters = {
        "nuscenes": NuScenesAdapter,
        # "kitti": KittiAdapter,
        # "waymo": WaymoAdapter,
        # "highd": HighDAdapter,
    }

    @classmethod
    def get_adapter(cls, dataset_type: str = None) -> BaseDatasetAdapter:
        target_type = dataset_type or settings.DEFAULT_DATASET_TYPE
        if target_type not in cls._adapters:
            raise ValueError(f"Unsupported dataset type: {target_type}")
        return cls._adapters[target_type]()
