import polygonSplitter from "polygon-splitter";

import { geojsonTypes, events } from "@mapbox/mapbox-gl-draw/src/constants";

import lineIntersect from "@turf/line-intersect";
import booleanDisjoint from "@turf/boolean-disjoint";
import lineOffset from "@turf/line-offset";
import lineToPolygon from "@turf/line-to-polygon";
import difference from "@turf/difference";
import { lineString } from "@turf/helpers";

import {
  modeName,
  passingModeNameLine,
  passingModeNamePolygon,
  highlightPropertyName,
  defaultOptions,
} from "./constants";

const SplitLineMode = {};

SplitLineMode.onSetup = function (opt) {
  const {
    featureIds = [],
    highlightColor = defaultOptions.highlightColor,
    lineWidth = defaultOptions.lineWidth,
    lineWidthUnit = defaultOptions.lineWidthUnit,
    onSelectFeatureRequest = defaultOptions.onSelectFeatureRequest,
  } = opt || {};
  console.log("== SplitLineMode.onSetup ")
  let selectedFeatures;

  const api = this._ctx.api;

  const featuresToSplit = [];

  if (featureIds.length !== 0) {
    featuresToSplit.push.apply(
      featuresToSplit,
      featureIds.map((id) => api.get(id))
    );
  } else {
      selectedFeatures = this.getSelected();
      console.log("--- this.getSelected() : ", selectedFeatures)
     if (selectedFeatures.length !== 0) {
      featuresToSplit.push.apply(
        featuresToSplit,
        selectedFeatures
          .filter(
            (f) =>
              f.type === geojsonTypes.LINE_STRING ||
              f.type === geojsonTypes.MULTI_LINE_STRING
          )
          .map((f) => f.toGeoJSON())
      );
    } else {
      return onSelectFeatureRequest();
    }
  }

  const state = {
    options: {
      highlightColor,
      lineWidth,
      lineWidthUnit,
    },
    featuresToSplit,
    api,
  };

  console.log("==== featuresToSplit : ", featuresToSplit)
  if (featuresToSplit.length==0) {
      this.changeMode("simple_select");
    return this.fireUpdate();
  }

  /// `onSetup` job should complete for this mode to work.
  /// so `setTimeout` is used to bupass mode change after `onSetup` is done executing.
  setTimeout(this.drawAndSplit.bind(this, state),500);
  // setTimeout(()=>this.highlighFeatures(state), 500);
  this.highlighFeatures(state)

  return state;
};

SplitLineMode.drawAndSplit = function (state) {
  const { api, options } = state;
  const { lineWidth, lineWidthUnit } = options;

  try {
    this.changeMode(passingModeNameLine, {
      onDraw: (cuttingLineString) => {
        const newPolygons = [];
        state.featuresToSplit.forEach((el) => {
          if (booleanDisjoint(el, cuttingLineString)) {
            console.info(`Line was outside of Polygon ${el.id}`);
            newPolygons.push(el);
            return;
          } else if (lineWidth === 0) {
            const polycut = polygonCut(el.geometry, cuttingLineString.geometry);
            polycut.id = el.id;
            api.add(polycut);
            newPolygons.push(polycut);
          } else {
            const polycut = polygonCutWithSpacing(
              el.geometry,
              cuttingLineString.geometry,
              {
                line_width: lineWidth,
                line_width_unit: lineWidthUnit,
              }
            );
            polycut.id = el.id;
            api.add(polycut);
            newPolygons.push(polycut);
          }
        });

        this.fireUpdate(newPolygons);
        this.highlighFeatures(state, false);
      },
      onCancel: () => {
        this.highlighFeatures(state, false);
      },
    });
  } catch (err) {
    console.error("🚀 ~ file: mode.js ~ line 116 ~ err", err);
  }
};

SplitLineMode.highlighFeatures = function (state, shouldHighlight = true) {

  const color = shouldHighlight ? state.options.highlightColor : undefined;

  state.featuresToSplit.forEach((f) => {
    console.log("--- highligh : ", f.id, highlightPropertyName, color)
    state.api.setFeatureProperty(f.id, highlightPropertyName, color);
  });
};

SplitLineMode.toDisplayFeatures = function (state, geojson, display) {
  display(geojson);
};

SplitLineMode.fireUpdate = function (newF) {
  this.map.fire(events.UPDATE, {
    action: modeName,
    features: newF,
  });
};

SplitLineMode.onStop = function ({ main }) {
  console.log("🚀 ~ file: mode.js ~ line 60 ~ onStop");
};

export default SplitLineMode;

/// Note: currently has some issues, but generally is a better approach
function polygonCut(poly, line) {
  return polygonSplitter(poly, line);
}

/// Adopted from https://gis.stackexchange.com/a/344277/145409
function polygonCutWithSpacing(poly, line, options) {
  const { line_width, line_width_unit } = options || {};

  const offsetLine = [];
  const retVal = null;
  let i, j, intersectPoints, forCut, forSelect;
  let thickLineString, thickLinePolygon, clipped;

  if (
    typeof line_width === "undefined" ||
    typeof line_width_unit === "undefined" ||
    (poly.type != geojsonTypes.POLYGON &&
      poly.type != geojsonTypes.MULTI_POLYGON) ||
    line.type != geojsonTypes.LINE_STRING
  ) {
    return retVal;
  }

  /// if line and polygon don't intersect return.
  if (booleanDisjoint(line, poly)) {
    return retVal;
  }

  intersectPoints = lineIntersect(poly, line);
  if (intersectPoints.features.length === 0) {
    return retVal;
  }

  /// Creating two new lines at sides of the splitting lineString
  offsetLine[0] = lineOffset(line, line_width, {
    units: line_width_unit,
  });
  offsetLine[1] = lineOffset(line, -line_width, {
    units: line_width_unit,
  });

  for (i = 0; i <= 1; i++) {
    forCut = i;
    forSelect = (i + 1) % 2;
    const polyCoords = [];
    for (j = 0; j < line.coordinates.length; j++) {
      polyCoords.push(line.coordinates[j]);
    }
    for (j = offsetLine[forCut].geometry.coordinates.length - 1; j >= 0; j--) {
      polyCoords.push(offsetLine[forCut].geometry.coordinates[j]);
    }
    polyCoords.push(line.coordinates[0]);

    thickLineString = lineString(polyCoords);
    thickLinePolygon = lineToPolygon(thickLineString);
    clipped = difference(poly, thickLinePolygon);
  }

  return clipped;
}
