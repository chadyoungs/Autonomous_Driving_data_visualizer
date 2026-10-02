// CoordinateTransformer.js
import * as THREE from 'three';

export const CoordinateTransformer = {
  /*
   * nuScenes ego coordinate -> Three.js coordinate
   * nuScenes: X towards front, Y towards left, Z towards up
   * Three.js: X towards front, Y towards up, Z towards right
   * @param {number} xNu nuScenes X
   * @param {number} yNu nuScenes Y
   * @param {number} zNu nuScenes Z
   * @returns {THREE.Vector3} three coordinate vector
   */
  transformPosition(xNu, yNu, zNu) {
    const x3 = xNu;
    const y3 = zNu;
    const z3 = -yNu;
    return new THREE.Vector3(x3, y3, z3);
  },

  /*
   * nuScenes quaternion convert to Three.js quaternion
   * nu raw quaternion: [w, x, y, z]
   * BoundingBoxManager: rotation[1], rotation[2], rotation[3], rotation[0] qx,qy,qz,qw
   * @param {number} qx 
   * @param {number} qy 
   * @param {number} qz 
   * @param {number} qw 
   * @returns {THREE.Quaternion}
   */
  transformRotation(qx, qy, qz, qw, categoryName) {
    // 1. get the quarternion from nuScenes
    const qNu = new THREE.Quaternion(qx, qy, qz, qw);
    
    let qTrans;
    
    if (categoryName && (categoryName.split(".")[0] === "vehicle" || categoryName.split(".")[0] === "movable_object")) {
    // 2. Create coordinate change quaternion: 90 degree (Math.PI / 2) rotation around the Z-axis
      qTrans = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      Math.PI / 2
      );
    }
    else{
      // 2. Create coordinate change quaternion: 90 degree (Math.PI / 2) rotation around the Z-axis
      qTrans = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      Math.PI / 2
      );
    }

    // 3. Compute the inverse (conjugate) of the transformation quaternion
    const qTransInv = qTrans.clone().invert();

    // 4. Perform change of basis: qOut = qTrans * qNu * qTransInv
    // Note: Three.js `q1.multiply(q2)` computes the mathematical quaternion product q1 * q2
    const qOut = qTrans.clone().multiply(qNu).multiply(qTransInv);

    return qOut;
  }
};
