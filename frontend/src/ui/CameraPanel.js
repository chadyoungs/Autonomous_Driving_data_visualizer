import { eventBus } from '../utils/EventEmitter.js';

export class CameraPanel {
  constructor(container) {
    this.container = container;
    this.cameras = [
      'CAM_FRONT',
      'CAM_FRONT_RIGHT',
      'CAM_BACK_RIGHT',
      'CAM_BACK',
      'CAM_BACK_LEFT',
      'CAM_FRONT_LEFT'
    ];

    // initial pos left / top
    const initPositions = [
      { top: 10, left: 10 },
      { top: 180, left: 10 },
      { top: 350, left: 10 },
      { top: 10, left: 260 },
      { top: 180, left: 260 },
      { top: 350, left: 260 },
    ];

    this.cardPositions = {};
    this.cameras.forEach((cam, idx) => {
      this.cardPositions[cam] = initPositions[idx];
    });

    this.prevBlobUrls = {};
    this.imgElements = {};
    this.cardElements = {};
    this.imageWrapElements = {};
    this.collapsedStates = {};

    // dragstate
    this.dragState = {
      isDragging: false,
      cam: null,
      offsetX: 0,
      offsetY: 0
    };

    this.render();
    this.bindDragGlobal();
  }

  render() {
    this.cameras.forEach(cam => {
      const card = document.createElement('div');
      card.className = 'camera-card';
      card.dataset.camera = cam;

      const pos = this.cardPositions[cam];
      card.style.top = `${pos.top}px`;
      card.style.left = `${pos.left}px`;

      const header = document.createElement('div');
      header.className = 'camera-header';

      const title = document.createElement('div');
      title.className = 'camera-title';
      title.textContent = cam;

      const btn = document.createElement('button');
      btn.className = 'camera-collapse-btn';
      btn.type = 'button';
      btn.textContent = '−';
      btn.title = 'image collapse/expand';

      header.appendChild(title);
      header.appendChild(btn);

      const imageWrap = document.createElement('div');
      imageWrap.className = 'camera-image-wrap';

      const img = document.createElement('img');
      img.alt = cam;

      imageWrap.appendChild(img);
      card.appendChild(header);
      card.appendChild(imageWrap);
      this.container.appendChild(card);

      this.imgElements[cam] = img;
      this.cardElements[cam] = card;
      this.imageWrapElements[cam] = imageWrap;
      this.collapsedStates[cam] = false;

      // bind collapse button click event
      btn.addEventListener('click', () => {
        this.toggleCollapse(cam, btn);
      });
      // drag events
      header.addEventListener('mousedown', (e) => {
        this.startDrag(e, cam);
      });
    });
  }

  startDrag(e, cam) {
    // Prevent dragging when clicking the collapse button
    if (e.target.classList.contains("camera-collapse-btn")) return;
    e.preventDefault();

    const card = this.cardElements[cam];
    this.dragState.isDragging = true;
    this.dragState.cam = cam;
    // Calculate the offset between the mouse position and the top-left corner of the card
    this.dragState.offsetX = e.clientX - card.offsetLeft;
    this.dragState.offsetY = e.clientY - card.offsetTop;
  }

  bindDragGlobal() {
    document.addEventListener('mousemove', (e) => {
      if (!this.dragState.isDragging) return;
      const cam = this.dragState.cam;
      const card = this.cardElements[cam];

      // Calculate the new position based on the mouse movement and the initial offset
      let newLeft = e.clientX - this.dragState.offsetX;
      let newTop = e.clientY - this.dragState.offsetY;

      // Ensure the card stays within the viewport boundaries
      if (newLeft < 0) newLeft = 0;
      if (newTop < 0) newTop = 0;
      if (newLeft + card.offsetWidth > window.innerWidth) {
        newLeft = window.innerWidth - card.offsetWidth;
      }
      if (newTop + card.offsetHeight > window.innerHeight) {
        newTop = window.innerHeight - card.offsetHeight;
      }

      card.style.left = `${newLeft}px`;
      card.style.top = `${newTop}px`;
      this.cardPositions[cam] = { top: newTop, left: newLeft };
    });

    document.addEventListener('mouseup', () => {
      this.dragState.isDragging = false;
    });
  }

  toggleCollapse(cam, btn) {
    const wrap = this.imageWrapElements[cam];
    const card = this.cardElements[cam];
    if (!wrap || !card) return;

    const collapsed = !this.collapsedStates[cam];
    this.collapsedStates[cam] = collapsed;

    if (collapsed) {
      wrap.classList.add('camera-image-wrap--collapsed');
      card.classList.add('camera-card--collapsed');
      card.style.height = '42px';
      card.style.resize = 'vertical';
      btn.textContent = '+';
      btn.title = 'Expand image';
    } else {
      wrap.classList.remove('camera-image-wrap--collapsed');
      card.classList.remove('camera-card--collapsed');
      card.style.height = '';
      card.style.resize = 'both';
      btn.textContent = '-';
      btn.title = 'Collapse image';
    }
  }

  updateImages(imagesMap) {
    this.cameras.forEach(cam => {
      const imgEl = this.imgElements[cam];
      if (!imgEl) return;

      if (this.prevBlobUrls[cam]) {
        URL.revokeObjectURL(this.prevBlobUrls[cam]);
      }

      if (imagesMap && imagesMap[cam]) {
        imgEl.src = imagesMap[cam];
        this.prevBlobUrls[cam] = imagesMap[cam];
      } else {
        imgEl.src = '';
        delete this.prevBlobUrls[cam];
      }
    });
  }

  collapseAll() {
    this.cameras.forEach(cam => {
      const btn = this.cardElements[cam]?.querySelector('.camera-collapse-btn');
      if (btn && !this.collapsedStates[cam]) {
        this.toggleCollapse(cam, btn);
      }
    });
  }

  expandAll() {
    this.cameras.forEach(cam => {
      const btn = this.cardElements[cam]?.querySelector('.camera-collapse-btn');
      if (btn && this.collapsedStates[cam]) {
        this.toggleCollapse(cam, btn);
      }
    });
  }

  destroy() {
    Object.values(this.prevBlobUrls).forEach(url => {
      URL.revokeObjectURL(url);
    });
    this.prevBlobUrls = {};
    this.imgElements = {};
    this.cardElements = {};
    this.imageWrapElements = {};
    this.collapsedStates = {};
  }
}
