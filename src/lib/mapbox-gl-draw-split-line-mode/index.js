import { default as splitLineMode } from "./mode.js";
import { default as drawStyles } from "./customDrawStyles.js";
import * as Constants from "./constants";

import { passing_draw_line_string, passing_draw_polygon } from "mapbox-gl-draw-passing-mode";
// import SelectFeatureMode from "../mapbox-gl-draw-select-mode";
import { modeName, passingModeNameLine, passingModeNamePolygon } from "./constants";

export { splitLineMode };
export { drawStyles };
export { Constants };

export default function SplitLineMode(modes) {
  return {
    // ...SelectFeatureMode(modes),
    ...modes,
    [passingModeNameLine]: passing_draw_line_string,
    [passingModeNamePolygon]: passing_draw_polygon,
    [modeName]: splitLineMode,
  };
}
