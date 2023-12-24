export const modeName = "split_line";

/// This mode uses the `mapbox-gl-draw-passing-mode` mode to draw the spilitting lineString.
/// here is the name used to add that mode:
export const passingModeNameLine = `${modeName}_passing_draw_line_string`;
export const passingModeNamePolygon = `${modeName}_passing_draw_polygon`;

/// when a (multi-)polygon feature is selected to be splitted, it gets highlighted.
/// here is the name of the property indicating the highlight.
export const highlightPropertyName = `${modeName}_highlight`; //"split_polygon_highlight";//

export const defaultOptions = {
  highlightColor: "#222",
  lineWidth: 0,
  lineWidthUnit: "kilometers",
  onSelectFeatureRequest() {
    throw new Error("no Feature is selected to split.");
  },
};
