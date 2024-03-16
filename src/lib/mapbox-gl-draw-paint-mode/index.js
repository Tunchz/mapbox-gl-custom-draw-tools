import { default as paintMode } from "./mode.js";
import { default as paintMode2 } from "../mapbox-gl-draw-paint-mode2/mode.js";
import { default as drawStyles } from "./customDrawStyles.js";
import { default as drawStyles2 } from "../mapbox-gl-draw-paint-mode2/customDrawStyles.js";
// import { modeName, passingModeName } from "./constants";

// export { cutPolygonMode as splitPolygonMode };
export { drawStyles };

export const modeName = "draw_paint_mode";

export default function PaintMode(modes, options={}) {
  return {
    ...modes,
    [modeName]: options?.mode==2?paintMode2:paintMode,
  };
}