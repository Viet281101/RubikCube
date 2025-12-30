import { INTERACT_MODE } from '../constants/index.js';

export default class RotateControls {
  constructor(app) {
    this.app = app;
    this.container = null;

    this._create();
    this._bindEvents();
  }

  _create() {
    this.container = document.createElement('div');
    this.container.className = 'rotate-controls';

    this.rotateBtn = document.createElement('button');
    this.rotateBtn.textContent = 'Rotate the Rubik';

    this.cancelBtn = document.createElement('button');
    this.cancelBtn.textContent = 'Cancel';
    this.cancelBtn.style.display = 'none';

    this.container.appendChild(this.rotateBtn);
    this.container.appendChild(this.cancelBtn);

    document.body.appendChild(this.container);
  }

  _bindEvents() {
    this.rotateBtn.addEventListener('click', () => {
      this.app.enterRotateMode();
      this._updateUI();
    });

    this.cancelBtn.addEventListener('click', () => {
      this.app.exitRotateMode();
      this._updateUI();
    });
  }

  _updateUI() {
    const isRotate = this.app.mode === INTERACT_MODE.ROTATE;
    this.rotateBtn.style.display = isRotate ? 'none' : 'inline-block';
    this.cancelBtn.style.display = isRotate ? 'inline-block' : 'none';
  }
}
