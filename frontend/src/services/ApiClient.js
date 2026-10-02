export class ApiClient {
  static baseUrl = '/api/v1/';
  
  static async getScenes(datasetType = 'nuscenes') {
    const res = await fetch(`${this.baseUrl}scenes?dataset_type=${datasetType}`);
    if (!res.ok) {
      throw new Error(`getScenes fetch failed: ${res.status}`);
    }
    return await res.json();
  }

  static async getSceneSamples(sceneName, datasetType = 'nuscenes') {
    const res = await fetch(`${this.baseUrl}scenes/${sceneName}/samples?dataset_type=${datasetType}`);
    if (!res.ok) {
      throw new Error(`getSceneSamples fetch failed: ${res.status}`);
    }
    return await res.json();
  }

  static async getPointCloudBinary(sampleToken, datasetType = 'nuscenes') {
    const res = await fetch(`${this.baseUrl}pointclouds/${sampleToken}/binary?dataset_type=${datasetType}`);
    if (!res.ok) {
      throw new Error(`getPointCloudBinary fetch failed: ${res.status}`);
    }
    const buffer = await res.arrayBuffer();
    return new Float32Array(buffer);
  }

  static async getBoxes(sampleToken, datasetType = 'nuscenes') {
    const res = await fetch(`${this.baseUrl}boxes/${sampleToken}?dataset_type=${datasetType}`);
    if (!res.ok) {
      throw new Error(`getBoxes fetch failed: ${res.status}`);
    }
    return await res.json();
  }

  static async getCameraImages(sampleToken, datasetType = 'nuscenes') {
    const camList = ["CAM_FRONT", "CAM_FRONT_LEFT", "CAM_FRONT_RIGHT", "CAM_BACK", "CAM_BACK_LEFT", "CAM_BACK_RIGHT"];
    const imageMap = {};
    for (const cam of camList) {
      const res = await fetch(`${this.baseUrl}images/${sampleToken}/${cam}?dataset_type=${datasetType}`);
      if (!res.ok) {
        throw new Error(`Image fetch failed ${cam}: ${res.status}`);
      }
      const blob = await res.blob();
      imageMap[cam] = URL.createObjectURL(blob);
    }
    return imageMap;
  }
}

