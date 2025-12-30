import * as THREE from 'three';
import { FACES, AXES } from '../constants/index.js';

export default class RotationManager {
  constructor({ scene, camera, domElement, rubik }) {
    this.scene = scene;
    this.camera = camera;
    this.domElement = domElement;
    this.rubik = rubik;

    // ===== State =====
    this.enabled = false;
    this.isRotating = false;

    // Raycasting
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Active rotation info
    this.active = {
      cubie: null,
      face: null, // FACES.*
      axis: null, // AXES.*
      layer: null, // index of layer
      direction: 1, // +1 / -1 (after)
    };

    // Temporary rotation group
    this.rotationGroup = null;

    // Bindings
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
  }

  /* =======================
   * Public API
   * ======================= */

  enable() {
    if (this.enabled) return;

    this.enabled = true;
    this._addEvents();
  }

  disable() {
    if (!this.enabled) return;

    this.enabled = false;
    this._removeEvents();
    this._resetActive();
  }

  update(/* delta */) {
    // to animate rotation after
    if (!this.isRotating) return;
  }

  /* =======================
   * Event handling
   * ======================= */

  _addEvents() {
    this.domElement.addEventListener('pointerdown', this._onPointerDown);
    window.addEventListener('pointermove', this._onPointerMove);
    window.addEventListener('pointerup', this._onPointerUp);
  }

  _removeEvents() {
    this.domElement.removeEventListener('pointerdown', this._onPointerDown);
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('pointerup', this._onPointerUp);
  }

  _onPointerDown(event) {
    if (!this.enabled || this.isRotating) return;

    const intersect = this._raycast(event);
    if (!intersect) return;

    const { cubie, face, axis, layer } = this._extractRotationInfo(intersect);

    this.active.cubie = cubie;
    this.active.face = face;
    this.active.axis = axis;
    this.active.layer = layer;

    console.log('[RotationManager]', {
      face,
      axis,
      layer,
      cubieIndex: cubie.index,
    });
  }

  _onPointerMove(/* event */) {
    if (!this.enabled || this.isRotating) return;
    // to detect drag direction after
  }

  _onPointerUp(/* event */) {
    if (!this.enabled || this.isRotating) return;

    if (!this.active.face) return;

    // Log
    console.log(
      `Ready to rotate face ${this.active.face} (axis ${this.active.axis}, layer ${this.active.layer})`
    );

    this._resetActive();
  }

  /* =======================
   * Raycast & detection
   * ======================= */

  _raycast(event) {
    const rect = this.domElement.getBoundingClientRect();

    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    const meshes = this.rubik.cubies.map((c) => c.object3D);
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length === 0) return null;

    return intersects[0];
  }

  _extractRotationInfo(intersect) {
    const cubie = this._findCubieFromMesh(intersect.object);

    const normal = intersect.face.normal.clone();
    normal.transformDirection(intersect.object.matrixWorld);

    const { face, axis } = this._getFaceFromNormal(normal);
    const layer = this._getLayerFromCubie(cubie, axis);

    return { cubie, face, axis, layer };
  }

  _findCubieFromMesh(mesh) {
    return this.rubik.cubies.find((c) => c.object3D === mesh);
  }

  _getFaceFromNormal(normal) {
    const absX = Math.abs(normal.x);
    const absY = Math.abs(normal.y);
    const absZ = Math.abs(normal.z);

    if (absX > absY && absX > absZ) {
      return {
        axis: AXES.X,
        face: normal.x > 0 ? FACES.RIGHT : FACES.LEFT,
      };
    }

    if (absY > absX && absY > absZ) {
      return {
        axis: AXES.Y,
        face: normal.y > 0 ? FACES.UP : FACES.DOWN,
      };
    }

    return {
      axis: AXES.Z,
      face: normal.z > 0 ? FACES.FRONT : FACES.BACK,
    };
  }

  _getLayerFromCubie(cubie, axis) {
    if (axis === AXES.X) return cubie.index.leftRight;
    if (axis === AXES.Y) return cubie.index.downUp;
    if (axis === AXES.Z) return cubie.index.backFront;
    return null;
  }

  _resetActive() {
    this.active.cubie = null;
    this.active.face = null;
    this.active.axis = null;
    this.active.layer = null;
    this.active.direction = 1;
  }
}
