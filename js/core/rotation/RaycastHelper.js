import * as THREE from 'three';
import { FACES, AXES, AXIS_TO_INDEX_KEY } from '../../constants/index.js';

/**
 * Helper class for raycasting and face detection
 */
export default class RaycastHelper {
  constructor(camera, rubik) {
    this.camera = camera;
    this.rubik = rubik;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  /**
   * Perform raycast from mouse position
   */
  raycast(event, domElement) {
    const rect = domElement.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const meshes = this.rubik.cubies.map((c) => c.object3D);
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length === 0) return null;

    return intersects[0];
  }

  /**
   * Extract rotation info from intersection
   */
  extractRotationInfo(intersect) {
    const cubie = this.findCubieFromMesh(intersect.object);

    const normal = intersect.face.normal.clone();
    normal.transformDirection(intersect.object.matrixWorld);

    const { face, axis } = this.getFaceFromNormal(normal);
    const layer = this.getLayerFromCubie(cubie, axis);

    return { cubie, face, axis, layer };
  }

  /**
   * Find cubie object from mesh
   */
  findCubieFromMesh(mesh) {
    return this.rubik.cubies.find((c) => c.object3D === mesh);
  }

  /**
   * Determine face and axis from normal vector
   */
  getFaceFromNormal(normal) {
    const abs = {
      x: Math.abs(normal.x),
      y: Math.abs(normal.y),
      z: Math.abs(normal.z),
    };

    const dominant = Object.entries(abs).reduce(
      (max, [key, val]) => (val > max.val ? { key, val } : max),
      { key: 'x', val: abs.x }
    );

    const faceMap = {
      x: { axis: AXES.X, face: normal.x > 0 ? FACES.RIGHT : FACES.LEFT },
      y: { axis: AXES.Y, face: normal.y > 0 ? FACES.UP : FACES.DOWN },
      z: { axis: AXES.Z, face: normal.z > 0 ? FACES.FRONT : FACES.BACK },
    };

    return faceMap[dominant.key];
  }

  /**
   * Get layer index from cubie based on axis
   */
  getLayerFromCubie(cubie, axis) {
    return cubie.index[AXIS_TO_INDEX_KEY[axis]] ?? null;
  }
}
