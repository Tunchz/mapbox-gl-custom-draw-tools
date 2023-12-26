import { geojsonTypes, events } from "@mapbox/mapbox-gl-draw/src/constants";
import lineSplit from "@turf/line-split";
import combine from "@turf/combine";
import flatten from "@turf/flatten";
import { featureCollection } from "@turf/helpers";

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
    spliter,
    features,
    highlightColor = defaultOptions.highlightColor,
    lineWidth = defaultOptions.lineWidth,
    lineWidthUnit = defaultOptions.lineWidthUnit,
    onSelectFeatureRequest = defaultOptions.onSelectFeatureRequest,
  } = opt || {};
  console.log("== SplitLineMode.onSetup ", features)
  let selectedFeatures;

  const api = this._ctx.api;

  const featuresToSplit = [];

  if (features.length !== 0) {
    featuresToSplit.push.apply(
      featuresToSplit,
      features
        .filter(
          (f) =>
            f.geometry?.type === geojsonTypes.LINE_STRING ||
            f.geometry?.type === geojsonTypes.MULTI_LINE_STRING
        )
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
    spliter: `split_line_passing_draw_${spliter}`,
    api,
  };

  console.log("==== featuresToSplit : ", featuresToSplit)
  if (featuresToSplit.length==0) {
      this.changeMode("simple_select");
    return this.fireUpdate();
  }

  /// `onSetup` job should complete for this mode to work.
  /// so `setTimeout` is used to bupass mode change after `onSetup` is done executing.
  // setTimeout(this.drawAndSplit.bind(this, state),500);
  // setTimeout(()=>this.highlighFeatures(state), 500);
  this.highlighFeatures(state)

  return state;
};

// SplitLineMode.drawAndSplit = function (state) {
//   const { api, options } = state;
//   const { lineWidth, lineWidthUnit } = options;

//   try {
//     this.changeMode(passingModeNameLine, {
//       onDraw: (cuttingLineString) => {
//         const newPolygons = [];
//         state.featuresToSplit.forEach((el) => {
//           if (booleanDisjoint(el, cuttingLineString)) {
//             console.info(`Line was outside of Polygon ${el.id}`);
//             newPolygons.push(el);
//             return;
//           } else if (lineWidth === 0) {
//             const polycut = polygonCut(el.geometry, cuttingLineString.geometry);
//             polycut.id = el.id;
//             api.add(polycut);
//             newPolygons.push(polycut);
//           } else {
//             const polycut = polygonCutWithSpacing(
//               el.geometry,
//               cuttingLineString.geometry,
//               {
//                 line_width: lineWidth,
//                 line_width_unit: lineWidthUnit,
//               }
//             );
//             polycut.id = el.id;
//             api.add(polycut);
//             newPolygons.push(polycut);
//           }
//         });

//         this.fireUpdate(newPolygons);
//         this.highlighFeatures(state, false);
//       },
//       onCancel: () => {
//         this.highlighFeatures(state, false);
//       },
//     });
//   } catch (err) {
//     console.error("🚀 ~ file: mode.js ~ line 116 ~ err", err);
//   }
// };

SplitLineMode.highlighFeatures = function (state, shouldHighlight = true) {

  const color = shouldHighlight ? state.options.highlightColor : undefined;

  state.featuresToSplit.forEach((f) => {
    // console.log("--- highligh : ", f.id, highlightPropertyName, color)
    state.api.setFeatureProperty(f.id, highlightPropertyName, color);
  });
};

// SplitLineMode.toDisplayFeatures = function (state, geojson, display) {
//   display(geojson);
// };
SplitLineMode.toDisplayFeatures = function (state, geojson, display) {
  // console.log("==== state.featuresToSplit : ", state.featuresToSplit)
  display(geojson);
  this.changeMode(state.spliter, {
    onDraw: (cut) => {
      state.featuresToSplit.forEach((mainFeature, idx) => {
        const splitedFeatures = [];
        flatten(mainFeature).features.forEach((feature) => {
          if (
            feature.geometry.type === geojsonTypes.LINE_STRING ||
            feature.geometry.type === geojsonTypes.MULTI_LINE_STRING
          ) {
            const afterCut = lineSplit(feature, cut);
            if (afterCut.features.length < 1)
              splitedFeatures.push(featureCollection([feature]));
            else splitedFeatures.push(afterCut);
          } else {
            throw new Error("The feature is not Linestring/MultiLinestring!");
          }
        });

        const collected = featureCollection(
          splitedFeatures.flatMap((featureColl) => featureColl.features)
        );
        const afterCutMultiLineString = combine(collected).features[0];
        afterCutMultiLineString.id = mainFeature.id;
        this._ctx.api.add(afterCutMultiLineString);
        this.fireUpdate(afterCutMultiLineString);
        this.highlighFeatures(state, false);
      });
    },
    onCancel: () => {
      this.highlighFeatures(state, false);
    },
  });
};
SplitLineMode.fireUpdate = function(newF) {
  this.map.fire(events.UPDATE, {
      action: 'SplitLine',
      features: newF
  });
};

SplitLineMode.onStop = function ({ main }) {
  console.log("🚀 ~ file: mode.js ~ line 60 ~ onStop");
};

export default SplitLineMode;
