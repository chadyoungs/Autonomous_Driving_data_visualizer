import * as THREE from 'three';
import { CoordinateTransformer } from './CoordinateTransformer.js';
/*
 *  Manage BufferGeometry memory and rendering of point cloud data in Three.js
 *  Each point is represented by 4 consecutive floats: [x, y, z, intensity]
 *  The intensity value is used to color the points based on their height (z-coordinate)
 */
export class PointCloudManager {
  constructor(scene) {
    this.scene = scene;
    this.particleSystem = null;
  }

  updatePoints(flatPoints) {
    // If the input array is too small, clear the existing point cloud and return
    if (flatPoints.length < 4) {
      this.clear();
      return;
    }
    /* Each point has 9 values: [x, y, z, intensity, r, g, b, cluster_id, is_ground]
       Raw point actually has 4 values: [x, y, z, intensity]
       the other 5 values are added by the backend for additional information, but we only need the first 4 values for rendering: [x, y, z, intensity]
    */
    const pointCount = Math.floor(flatPoints.length / 9); 
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3);

    for (let i = 0; i < pointCount; i++) {
      const rawX = flatPoints[i * 9];
      const rawY = flatPoints[i * 9 + 1];
      const rawZ = flatPoints[i * 9 + 2];
      const intensity = flatPoints[i * 9 + 3];
      
      // 1. coordinate transformation from nuScenes to Three.js
      const p = CoordinateTransformer.transformPosition(rawX, rawY, rawZ);
      positions[i * 3] = p.x;
      positions[i * 3 + 1] = p.y;
      positions[i * 3 + 2] = p.z;
      
      // 2. using normalized height for coloring
      // It has been defined in the backend, however, we still need to normalize it here for Three.js rendering
      const normHeight = Math.min(Math.max((p.y + 2) / 5, 0), 1);
      colors[i * 3] = normHeight;              // R
      colors[i * 3 + 1] = 0.5;                  // G
      colors[i * 3 + 2] = 1.0 - normHeight;      // B
    }

    // 3. remove old particle system if it exists
    if (this.particleSystem) {
      this.scene.remove(this.particleSystem);
      this.particleSystem.geometry.dispose();
      this.particleSystem.material.dispose();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 0.15,
      vertexColors: true,
      sizeAttenuation: true
    });
    this.particleSystem = new THREE.Points(geometry, material);
    this.scene.add(this.particleSystem);
  }

  clear() {
    if (this.particleSystem) {
      this.scene.remove(this.particleSystem);
      this.particleSystem.geometry?.dispose();
      this.particleSystem.material?.dispose();
      this.particleSystem = null;
    }
  }
}
