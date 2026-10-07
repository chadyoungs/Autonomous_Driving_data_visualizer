import os

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "AD Data Visualization API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEFAULT_DATASET_TYPE: str = os.getenv("DEFAULT_DATASET_TYPE", "nuscenes")

    NUSCENES_DATA_DIR: str = os.getenv("NUSCENES_DATA_DIR", "/data/nuscenes")
    NUSCENES_VERSION: str = os.getenv("NUSCENES_VERSION", "v1.0-mini")

    # Point cloud and cache settings
    POINTCLOUD_MAX_POINTS: int = 100000  # Maximum number of points to return from point cloud data
    CACHE_MAX_SIZE: int = 200  # LRU

    class Config:
        case_sensitive = True


settings = Settings()
