import numpy as np
from app.utils.pcd.pcd_utils import PointCloudData


class FlexiblePipeline:
    def __init__(self, steps: list = None):
        self.steps = steps if steps is not None else []

    def add_step(self, step):
        self.steps.append(step)
        return self  # Supports method chaining

    def __call__(self, raw_points: np.ndarray) -> np.ndarray:
        # Input parsing: Compatible with both (N, 3) and (N, 4) inputs
        if raw_points.shape[1] >= 4:
            xyz = raw_points[:, :3]
            intensity = raw_points[:, 3:4]
        else:
            xyz = raw_points[:, :3]
            intensity = np.zeros((len(xyz), 1), dtype=np.float32)

        pcd = PointCloudData(xyz=xyz, intensity=intensity)

        # Pass sequentially through each processing module
        for step in self.steps:
            pcd = step(pcd)

        return pcd.to_array()
