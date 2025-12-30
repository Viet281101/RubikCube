export default class ModeIndicator {
  constructor(app) {
    this.app = app;
    this.element = null;

    this._create();
    this._update();

    this._tick = this._tick.bind(this);
    requestAnimationFrame(this._tick);
  }

  _create() {
    this.element = document.createElement('div');
    this.element.className = 'mode-indicator';
    document.body.appendChild(this.element);
  }

  _update() {
    this.element.textContent = 'INTERACT MODE : ' + String(this.app.mode);

    this.element.dataset.mode = this.app.mode;
  }

  _tick() {
    this._update();
    requestAnimationFrame(this._tick);
  }
}
