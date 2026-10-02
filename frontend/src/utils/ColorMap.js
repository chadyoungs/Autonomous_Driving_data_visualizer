
export const CATEGORY_COLORS = {
  'car': 0x00ff7f,        // green
  'truck': 0x00bfff,      // blue
  'bus': 0xffa500,        // orange
  'trailer': 0x8b4513,    // brown
  'construction_vehicle': 0xff4500, // red-orange
  'adult': 0xff0055,         // red
  'cyclist': 0xffff00,            // yellow
  'trafficcone': 0xff8800, // traffic cone orange
  'barrier': 0xbb44bb,      // barrier purple
  'default': 0xcccccc
};

const OBJECT_PALETTE = {
  "car": (255 << 16) + (158 << 8) + 0,
  "truck": (255 << 16) + (99 << 8) + 71,
  "construction_vehicle": (233 << 16) + (150 << 8) + 70,
  "bus": (255 << 16) + (69 << 8) + 0,
  "trailer": (255 << 16) + (140 << 8) + 0,
  "barrier": (112 << 16) + (128 << 8) + 144,
  "motorcycle": (255 << 16) + (61 << 8) + 99,
  "bicycle": (220 << 16) + (20 << 8) + 60,
  "pedestrian": (0 << 16) + (0 << 8) + 230,
  "traffic_cone": (47 << 16) + (79 << 8) + 79,
  "tricycle": (220 << 16) + (20 << 8) + 60,
  "cyclist": (220 << 16) + (20 << 8) + 60
};

// BEV semantic map palette
export const MAP_PALETTE = {
  "drivable_area": (166 << 16) + (206 << 8) + 227,
  "road_segment": (31 << 16) + (120 << 8) + 180,
  "road_block": (178 << 16) + (223 << 8) + 138,
  "lane": (51 << 16) + (160 << 8) + 44,
  "ped_crossing": (251 << 16) + (154 << 8) + 153,
  "walkway": (227 << 16) + (26 << 8) + 28,
  "stop_line": (253 << 16) + (191 << 8) + 111,
  "carpark_area": (255 << 16) + (127 << 8) + 0,
  "road_divider": (202 << 16) + (178 << 8) + 214,
  "lane_divider": (106 << 16) + (61 << 8) + 154,
  "divider": (106 << 16) + (61 << 8) + 154,
};

/*
 * get the line color based on category name
 * prior using CATEGORY_COLORS，then using OBJECT_PALETTE
 * @param {string} categoryName
 * @returns {number} three.js hex color
 */
export function getCategoryColor(categoryName) {
  if (!categoryName) return CATEGORY_COLORS.default;
  console.log("sub-category", categoryName);
  if (CATEGORY_COLORS.hasOwnProperty(categoryName)) {
    console.log("✅get the defined color", categoryName);
    return CATEGORY_COLORS[categoryName];
  }
  const keys = Object.keys(CATEGORY_COLORS);
  for (const key of keys) {
    if (categoryName.startsWith(key)) {
      console.log("✅prefix correspondingcolor", key);
      return CATEGORY_COLORS[key];
    }
  }
  if (OBJECT_PALETTE.hasOwnProperty(categoryName)) {
    console.log("⚠️using mmdet3d color", categoryName);
    return OBJECT_PALETTE[categoryName];
  }
  console.log("❌not matched, default grey");
  return CATEGORY_COLORS.default;
}
