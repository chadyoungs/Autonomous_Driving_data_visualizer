import { eventBus } from '../utils/EventEmitter.js';
export class ControlBar {
  constructor(container) {
    this.container = container;
    this.currentFrame = 0;
    this.totalFrames = 0;
    this.isPlaying = false;
    this.timer = null;
    this.element = null;
    this.render();
    this.bindEvents();
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'control-bar';
    this.element.innerHTML = `
      <button id="prev-btn">prev frame</button>
      <button id="play-btn">play</button>
      <button id="next-btn">next frame</button>
      <span>frame: <span id="frame-num">0</span> / <span id="total-num">0</span></span>
      <input type="range" id="frame-slider" min="0" max="0" value="0" />
    `;
    this.container.appendChild(this.element);
  }

  setTotalFrames(num) {
    this.totalFrames = num;
    const slider = this.element.querySelector('#frame-slider');
    const totalNumEl = this.element.querySelector('#total-num');
    slider.max = Math.max(num - 1, 0);
    totalNumEl.innerText = num;
    this.currentFrame = 0;
    this.updateFrameDisplay();
  }

  updateFrameDisplay() {
    const frameNum = this.element.querySelector('#frame-num');
    const slider = this.element.querySelector('#frame-slider');
    frameNum.innerText = this.currentFrame;
    slider.value = this.currentFrame;
  }

  bindEvents() {
    const playBtn = this.element.querySelector('#play-btn');
    const slider = this.element.querySelector('#frame-slider');
    const prevBtn = this.element.querySelector('#prev-btn');
    const nextBtn = this.element.querySelector('#next-btn');

    // play/pause button
    playBtn.onclick = () => {
      this.isPlaying = !this.isPlaying;
      playBtn.innerText = this.isPlaying ? 'Pause' : 'Play';
      if (this.isPlaying) {
        this.timer = setInterval(() => {
          this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
          this.updateFrameDisplay();
          eventBus.emit('frame:change', this.currentFrame);
        }, 250);
      } else {
        clearInterval(this.timer);
        this.timer = null;
      }
    };

    // slider input event
    slider.oninput = (e) => {
      this.currentFrame = parseInt(e.target.value, 10);
      this.updateFrameDisplay();
      eventBus.emit('frame:change', this.currentFrame);
    };

    // prev frame
    prevBtn.onclick = () => {
      if (this.currentFrame > 0) {
        this.currentFrame -= 1;
        this.updateFrameDisplay();
        eventBus.emit('frame:change', this.currentFrame);
      }
    };
    // next frame
    nextBtn.onclick = () => {
      if (this.currentFrame < this.totalFrames - 1) {
        this.currentFrame += 1;
        this.updateFrameDisplay();
        eventBus.emit('frame:change', this.currentFrame);
      }
    };

  }
}
