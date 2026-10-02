import './styles/main.css';
import { Viewer3D } from './core/Viewer3D.js';
import { ControlBar } from './ui/ControlBar.js';
import { CameraPanel } from './ui/CameraPanel.js';
import { eventBus } from './utils/EventEmitter.js';
import { ApiClient } from './services/ApiClient.js';

class App {
  constructor() {
    this.appContainer = document.getElementById('app-container');
    this.controlBarContainer = document.getElementById('control-bar-container');
    this.cameraContainer = document.getElementById('camera-panels-container');
    this.samples = [];
    this.isLoading = false;
    this.init();
  }

  async init() {
    // DOM存在性校验
    if (!this.appContainer || !this.controlBarContainer || !this.cameraContainer) {
      console.error("DOM容器缺失，检查html id");
      return;
    }

    // 1. initialize 3D viewer
    this.viewer = new Viewer3D(this.appContainer);

    // 2. initialize UI components
    this.controlBar = new ControlBar(this.controlBarContainer);
    this.cameraPanel = new CameraPanel(this.cameraContainer);

    // 3. reading url parameters to get the target scene name
    const urlParams = new URLSearchParams(window.location.search);
    const targetSceneName = urlParams.get("scene");

    try {
      // 4. get available scenes from backend
      const scenesList = await ApiClient.getScenes();
      
      if (scenesList.length > 0) {
        // 5. find the target scene
        const targetScene = scenesList.find(s => s.name === targetSceneName);
        if (!targetScene) {
          console.error("scene not found", targetSceneName);
          return;
        }

        // 6. get samples for the target scene
        const res = await ApiClient.getSceneSamples(targetSceneName);
        this.samples = res.samples;

        this.controlBar.setTotalFrames(this.samples.length);
      }

      // 7. bind frame change event to load the corresponding frame
      eventBus.on('frame:change', this.onFrameChange.bind(this));

      // 8. load the first frame if samples are available
      if (this.samples.length > 0) {
        await this.loadFrame(0);
      }
    } catch (err) {
      console.error("Init app failed: ", err);
    }
  }

  // Handle frame change event
  async onFrameChange(frameIdx) {
    await this.loadFrame(frameIdx);
  }

  async loadFrame(frameIdx) {
    if (this.isLoading) return;
    if (frameIdx < 0 || frameIdx >= this.samples.length) return;

    this.isLoading = true;
    try {
      const sampleItem = this.samples[frameIdx];
      const sampleToken = sampleItem.sample_token;

      // Fetch point cloud, boxes, and camera images in parallel
      const resList = await Promise.allSettled([
        ApiClient.getPointCloudBinary(sampleToken),
        ApiClient.getBoxes(sampleToken),
        ApiClient.getCameraImages(sampleToken)
      ]);

      const pointData = resList[0].status === 'fulfilled' ? resList[0].value : null;
      const boxes = resList[1].status === 'fulfilled' ? resList[1].value : [];
      const cameraImages = resList[2].status === 'fulfilled' ? resList[2].value : {};

      // render and update UI
      this.viewer.renderFrame(pointData, boxes);
      if (this.cameraPanel) {
        this.cameraPanel.updateImages(cameraImages);
      }
    } catch (err) {
      console.error(`load frame ${frameIdx} error:`, err);
    } finally {
      this.isLoading = false;
    }
  }
}

// start the app
new App();
