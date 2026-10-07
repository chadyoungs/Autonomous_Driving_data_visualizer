export class ApiClient {
  static baseUrl = '/api/v1/';
  
  static async getScenes(datasetType = 'nuscenes') {
    const res = await fetch(`${this.baseUrl}scenes?dataset_type=${datasetType}`);
    if (!res.ok) {
      throw new Error(`getScenes fetch failed: ${res.status}`);
    }
    return await res.json();
  }
  
  static async getSceneDescription(sceneName, datasetType = 'nuscenes') {
    const res = await fetch(`${this.baseUrl}scenes/${sceneName}/description?dataset_type=${datasetType}`);
    if (!res.ok) {
      let errInfo;
      try {
        errInfo = await res.json();
      } catch {
        errInfo = { detail: res.statusText };
      }

      const msg = errInfo.detail || errInfo.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return await res.json();
  }
  
  static async getSceneSamples(sceneName, datasetType = 'nuscenes') {
    const res = await fetch(`${this.baseUrl}scenes/${sceneName}/samples?dataset_type=${datasetType}`);
    if (!res.ok) {
      let errInfo;
      try {
        errInfo = await res.json();
      } catch {
        errInfo = { detail: res.statusText };
      }

      const msg = errInfo.detail || errInfo.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return await res.json();
  }

  static async getPointCloudBinary(sampleToken, datasetType = 'nuscenes') {
    const res = await fetch(`${this.baseUrl}pointclouds/${sampleToken}/binary?dataset_type=${datasetType}`);
    if (!res.ok) {
      let errInfo;
      try {
        errInfo = await res.json();
      } catch {
        errInfo = { detail: res.statusText };
      }

      const msg = errInfo.detail || errInfo.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    const buffer = await res.arrayBuffer();
    return new Float32Array(buffer);
  }
  
  static async getCameraImages(sampleToken, datasetType = 'nuscenes') {
    const camList = ["CAM_FRONT", "CAM_FRONT_LEFT", "CAM_FRONT_RIGHT", "CAM_BACK", "CAM_BACK_LEFT", "CAM_BACK_RIGHT"];
    const imageMap = {};
    for (const cam of camList) {
      const res = await fetch(`${this.baseUrl}images/${sampleToken}/${cam}?dataset_type=${datasetType}`);
      if (!res.ok) {
        let errInfo;
        try {
          errInfo = await res.json();
        } catch {
          errInfo = { detail: res.statusText };
        }

        const msg = errInfo.detail || errInfo.message || `HTTP ${res.status}`;
        throw new Error(msg);
      }
      const blob = await res.blob();
      imageMap[cam] = URL.createObjectURL(blob);
    }
    return imageMap;
  }

  static async getBoxes(sampleToken, datasetType = 'nuscenes') {
    const res = await fetch(`${this.baseUrl}boxes/${sampleToken}?dataset_type=${datasetType}`);
    if (!res.ok) {
      let errInfo;
      try {
        errInfo = await res.json();
      } catch {
        errInfo = { detail: res.statusText };
      }

      const msg = errInfo.detail || errInfo.message || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return await res.json();
  }
}

