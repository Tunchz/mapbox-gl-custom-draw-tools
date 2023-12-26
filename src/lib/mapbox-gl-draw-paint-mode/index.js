import { default as paintMode } from "./mode.js";
import { default as drawStyles } from "./customDrawStyles.js";
// import { modeName, passingModeName } from "./constants";

// export { cutPolygonMode as splitPolygonMode };
export { drawStyles };

export const modeName = "draw_paint_mode";

export default function PaintMode(modes) {
  return {
    ...modes,
    [modeName]: paintMode,
  };
}