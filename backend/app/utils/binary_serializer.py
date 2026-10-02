import numpy as np


class BinarySerializer:
    @staticmethod
    def pack_point_cloud(points: np.ndarray) -> bytes:
        """
        numpy ndarray (N, 4) -> [x, y, z, intensity] bytes
        """
        if points.dtype != np.float32:
            points = points.astype(np.float32)
        return points.tobytes()
