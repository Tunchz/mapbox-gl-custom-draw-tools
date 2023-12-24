export const modeName = "cut_polygon";

/// This mode uses the `mapbox-gl-draw-passing-mode` mode to draw the spilitting lineString.
/// here is the name used to add that mode:
export const passingModeName = `${modeName}_passing_draw_polygon`;

/// when a (multi-)polygon feature is selected to be splitted, it gets highlighted.
/// here is the name of the property indicating the highlight.
export const highlightPropertyName = `${modeName}_highlight`;

export const defaultOptions = {
  highlightColor: "#222",
  lineWidth: 0.001,
  lineWidthUnit: "kilometers",
};
