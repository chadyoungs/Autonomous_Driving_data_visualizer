/**
 * 全局事件总线，实现 UI 与 3D 渲染层的彻底解耦
 */
export class EventEmitter {
  constructor() {
    this.events = {};
  }

  /*
   * @param {string} event
   * @param {Function} listener
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  /*
   * @param {string} event
   * @param {Function} listener
   */
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  /*
   * @param {string} event
   * @param  {...any} args
   */
  emit(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
}
export const eventBus = new EventEmitter();
