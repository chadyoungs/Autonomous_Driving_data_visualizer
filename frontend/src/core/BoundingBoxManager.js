import * as THREE from 'three';
import { CoordinateTransformer } from './CoordinateTransformer.js';
import { getCategoryColor } from '../utils/ColorMap.js';

/*
 * 3D Bounding Box manager
 */
export class BoundingBoxManager {
  constructor(scene) {
    this.scene = scene;
    this.boxGroup = new THREE.Group();
    this.scene.add(this.boxGroup);
  }

  /*
   * constuct text Sprite， close to the upper side of box，always facing the camera
   * @param {string} text 
   * @param {number} color three hex color
   * @returns {THREE.Sprite}
   */
  createTextSprite(text, color) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;

    // three hex color to rgb
    const r = (color >> 16) & 0xff;
    const g = (color >> 8) & 0xff;
    const b = color & 0xff;

    ctx.font = 'Bold 30px Arial';
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(4, 1, 1);
    return sprite;
  }

  /*
   * rendering 3D boxes in current frame
   * @param {Array} boxes - box data list
   */
  updateBoxes(boxes) {
    this.clear();
    if (!Array.isArray(boxes) || boxes.length === 0) return;

    boxes.forEach(box => {
      const { translation, size, rotation, category_name } = box;
      // nuScenes size: [width, length, height]
      const [w, l, h] = size;
      const geometry = new THREE.BoxGeometry(w, h, l);
      const edges = new THREE.EdgesGeometry(geometry);
      const color = getCategoryColor(category_name.split('.').at(-1)) ?? 0xffffff;
      const material = new THREE.LineBasicMaterial({ color });
      const wireframe = new THREE.LineSegments(edges, material);

      // nuScenes translation [x,y,z] => Three.js position
      const pos = CoordinateTransformer.transformPosition(
        translation[0],
        translation[1],
        translation[2]
      );
      wireframe.position.copy(pos);
      
      const rot = CoordinateTransformer.transformRotation(
          rotation[1], rotation[2], rotation[3], rotation[0], category_name
        );
      wireframe.quaternion.copy(rot);
      
      this.boxGroup.add(wireframe);

      // add text label
      const labelSprite = this.createTextSprite(category_name, color);
      const labelPos = pos.clone();
      labelPos.y += h / 2 + 0.3;
      labelSprite.position.copy(labelPos);
      this.boxGroup.add(labelSprite);
    });
  }

  clear() {
    // clear all wireframes and sprites, dispose geometry/texture/material to prevent memory leaks
    while (this.boxGroup.children.length > 0) {
      const obj = this.boxGroup.children[0];
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (obj.material.map) {
          obj.material.map.dispose();
        }
        obj.material.dispose();
      }
      this.boxGroup.remove(obj);
    }
  }
}
