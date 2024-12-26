import ellipseMode1 from "./mode_1.js";
import ellipseMode2 from "./mode_2.js";

export default function EllipseMode(options={}) {
  return options?.mode==2?ellipseMode2:ellipseMode1;
}