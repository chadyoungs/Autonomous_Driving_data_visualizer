import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { PointCloudManager } from './PointCloudManager.js';
import { BoundingBoxManager } from './BoundingBoxManager.js';
/**
 * 3D Viewer
 * 1. Using three.js to render pointclouds and 3D bounding boxes
 * 2. managing point clouds and bounding boxes with a unified manager, responsible for memory management and rendering
 * 3. provide rendering interface renderFrame(pointData, boxes)
 * 4. provide camera controller, supporting mouse drag rotation, zooming, and panning
 * 5. provide window adaptive size adjustment
 * 6. provide coordinate system helper lines and grid for debugging
 * 7. provide global event bus, UI layer can notify 3D rendering layer to load different frame data
 * 8. provide frame switching interface onFrameChange(frameIdx)  
 */
export class Viewer3D {
  constructor(container) {
    this.container = container;
    // 1. Scene
    this.scene = new THREE.Scene();
    
    // 2. Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    // 3. Camera
    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      500
    );
    this.camera.position.set(0, 30, 40);
    // this.camera.lookAt(0,0,0);

    // 4. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // 5. Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    // 6. Grid Helper & Origin Axis
    const grid = new THREE.GridHelper(100, 100, 0x444444, 0x222222);
    this.scene.add(grid);

    const axesHelper = new THREE.AxesHelper(10);
    this.scene.add(axesHelper);

    // 7. data managers
    this.pointCloudManager = new PointCloudManager(this.scene);
    this.boxManager = new BoundingBoxManager(this.scene);

    window.addEventListener('resize', this.onWindowResize.bind(this));
    this.animate();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  renderFrame(pointData, boxes) {
    this.pointCloudManager.updatePoints(pointData);
    this.boxManager.updateBoxes(boxes);
  }
}
