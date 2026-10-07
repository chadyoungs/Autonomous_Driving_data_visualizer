class BizError(Exception):
    status_code: int

    def __init__(self, msg: str):
        self.msg = msg


class DatasetNotFoundError(BizError):
    status_code = 400

    def __init__(self, dataset_type: str):
        super().__init__(f"dataset not found, type={dataset_type}, Mount the dataset or set NUSCENES_DATA_DIR.")


class SceneNotFoundError(BizError):
    status_code = 400

    def __init__(self, scene_name: str):
        super().__init__(f"can't find scene, name={scene_name}.")


class PcdFileNotFoundError(BizError):
    status_code = 400

    def __init__(self, pcl_path: str):
        super().__init__(f"Point cloud file not found: {pcl_path}")


class CameraFileNotFoundError(BizError):
    status_code = 400

    def __init__(self, sample_token: str, cam_name: str):
        super().__init__(f"can't find camera image file, sample_token={sample_token}, cam_name={cam_name}.")
