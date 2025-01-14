import circleMode1 from "./mode_1.js";
import circleMode2 from "./mode_2.js";
// const DirectModeOverride = require("./DirectModeOverride.js");
// const SimpleSelectModeOverride = require("./SimpleSelectModeOverride.js");

export default function CircleMode(options={}) {
  return options?.mode==2?circleMode2:circleMode1;
}

// export {
//   DirectModeOverride,
//   SimpleSelectModeOverride,
// }