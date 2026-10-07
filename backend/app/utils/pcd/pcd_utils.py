import logging
from dataclasses import dataclass, field
from typing import Optional

import numpy as np
from sklearn.cluster import DBSCAN

logger = logging.getLogger("app_logger")


@dataclass
class PointCloudData:
    """Unified point cloud data container to ensure safety and consistency across pipeline modules."""

    xyz: np.ndarray  # (N, 3) float32
    intensity: Optional[np.ndarray] = None  # (N, 1) float32
    rgb: Optional[np.ndarray] = None  # (N, 3) float32
    ground_mask: Optional[np.ndarray] = None  # (N,) bool
    cluster_ids: Optional[np.ndarray] = None  # (N,) int32, -1: ground, -2: noise, >=0: cluster_id

    def __post_init__(self):
        n_pts = len(self.xyz)
        if self.intensity is None:
            self.intensity = np.zeros((n_pts, 1), dtype=np.float32)
        if self.rgb is None:
            self.rgb = np.ones((n_pts, 3), dtype=np.float32) * 0.7  # Default light gray
        if self.cluster_ids is None:
            self.cluster_ids = np.full(n_pts, -1, dtype=np.int32)
        if self.ground_mask is None:
            self.ground_mask = np.zeros(n_pts, dtype=bool)

    def to_array(self) -> np.ndarray:
        """Export as (N, 9) array: [x, y, z, intensity, r, g, b, cluster_id, is_ground]."""
        return np.concatenate(
            [
                self.xyz,
                self.intensity.reshape(-1, 1),
                self.rgb,
                self.cluster_ids.astype(np.float32).reshape(-1, 1),
                self.ground_mask.astype(np.float32).reshape(-1, 1),
            ],
            axis=-1,
        )


class DistanceFilter:
    def __init__(self, min_range: float = 1.0, max_range: float = 75.0):
        self.min_range = min_range
        self.max_range = max_range

    def __call__(self, pcd: PointCloudData) -> PointCloudData:
        if len(pcd.xyz) == 0:
            return pcd
        dist_xy = np.linalg.norm(pcd.xyz[:, :2], axis=1)
        mask = (dist_xy >= self.min_range) & (dist_xy <= self.max_range)

        return PointCloudData(
            xyz=pcd.xyz[mask],
            intensity=pcd.intensity[mask],
            rgb=pcd.rgb[mask],
            ground_mask=pcd.ground_mask[mask],
            cluster_ids=pcd.cluster_ids[mask],
        )


class ClusterColorizer:
    def __init__(self, palette: Optional[np.ndarray] = None):
        if palette is None:
            self.palette = np.array(
                [
                    [1, 0.2, 0.2],
                    [0.2, 1, 0.2],
                    [0.2, 0.2, 1],
                    [1, 1, 0.2],
                    [1, 0.2, 1],
                    [0.2, 1, 1],
                    [1, 0.7, 0.2],
                    [0.7, 0.2, 1],
                    [0.2, 0.7, 1],
                ],
                dtype=np.float32,
            )
        else:
            self.palette = palette

    def __call__(self, pcd: PointCloudData) -> PointCloudData:
        n = len(pcd.xyz)
        rgb = np.ones((n, 3), dtype=np.float32) * 0.7  # Default color

        # 1. Ground points: Gray
        rgb[pcd.ground_mask] = [0.4, 0.4, 0.4]

        # 2. Cluster noise points (-2): Dark gray
        noise_mask = pcd.cluster_ids == -2
        rgb[noise_mask] = [0.15, 0.15, 0.15]

        # 3. Object clusters (>=0): Assign colors cyclically from the palette
        obj_mask = pcd.cluster_ids >= 0
        obj_clusters = np.unique(pcd.cluster_ids[obj_mask])
        for cid in obj_clusters:
            c_mask = pcd.cluster_ids == cid
            rgb[c_mask] = self.palette[cid % len(self.palette)]

        pcd.rgb = rgb
        return pcd


class VoxelDownsampler:
    def __init__(self, voxel_size: float = 0.3):
        self.voxel_size = voxel_size

    def __call__(self, pcd: PointCloudData) -> PointCloudData:
        xyz = pcd.xyz
        if len(xyz) == 0 or self.voxel_size <= 0:
            return pcd

        coords = np.floor(xyz / self.voxel_size).astype(np.int32)
        # pack (x,y,z) int triplet into single viewable type for fast unique
        dtype = np.dtype((np.void, coords.dtype.itemsize * coords.shape[1]))
        packed = coords.view(dtype).ravel()
        _, idx = np.unique(packed, return_index=True)

        return PointCloudData(
            xyz=xyz[idx],
            intensity=pcd.intensity[idx],
            rgb=pcd.rgb[idx],
            ground_mask=pcd.ground_mask[idx],
            cluster_ids=pcd.cluster_ids[idx],
        )

class RANSACGroundSegmenter:
    def __init__(self, ransac_threshold: float = 0.2, n_iter: int = 40):
        self.thresh = ransac_threshold
        self.n_iter = n_iter

    def __call__(self, pcd: PointCloudData) -> PointCloudData:
        n_points = len(pcd.xyz)
        ground_mask = np.zeros(n_points, dtype=bool)

        # Defensive check: Cannot form a plane with fewer than 3 points
        if n_points < 3:
            pcd.ground_mask = ground_mask
            return pcd

        best_inlier_count = -1
        best_plane = None

        for _ in range(self.n_iter):
            sample_idx = np.random.choice(n_points, 3, replace=False)
            p0, p1, p2 = pcd.xyz[sample_idx]
            v1, v2 = p1 - p0, p2 - p0
            normal = np.cross(v1, v2)
            norm_len = np.linalg.norm(normal)
            if norm_len < 1e-6:
                continue
            normal = normal / norm_len
            d = -np.dot(normal, p0)

            plane_dist = np.abs(np.dot(pcd.xyz, normal) + d)
            inlier_mask = plane_dist < self.thresh
            inlier_cnt = np.sum(inlier_mask)

            if inlier_cnt > best_inlier_count:
                best_inlier_count = inlier_cnt
                best_plane = (normal, d)

        # Defensive check: Mark all points as non-ground if no valid plane was found
        if best_plane is not None:
            normal, d = best_plane
            plane_dist = np.abs(np.dot(pcd.xyz, normal) + d)
            ground_mask = plane_dist < self.thresh

        pcd.ground_mask = ground_mask
        return pcd


class DBSCANClusterer:
    def __init__(self, eps: float = 0.6, min_samples: int = 15):
        self.eps = eps
        self.min_samples = min_samples

    def __call__(self, pcd: PointCloudData) -> PointCloudData:
        n_points = len(pcd.xyz)
        cluster_ids = np.full(n_points, -1, dtype=np.int32)

        # Perform clustering exclusively on non-ground points
        non_ground_mask = ~pcd.ground_mask
        non_ground_idx = np.nonzero(non_ground_mask)[0]

        if len(non_ground_idx) >= self.min_samples:
            non_ground_xyz = pcd.xyz[non_ground_idx]
            db = DBSCAN(eps=self.eps, min_samples=self.min_samples).fit(non_ground_xyz)
            labels = db.labels_

            # Label -1 represents DBSCAN noise; remapped to -2 to distinguish from ground points (-1)
            mapped_labels = np.where(labels == -1, -2, labels)
            cluster_ids[non_ground_idx] = mapped_labels

        pcd.cluster_ids = cluster_ids
        return pcd
