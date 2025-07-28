import {
  geojsonTypes,
  updateActions,
  events,
} from "@mapbox/mapbox-gl-draw/src/constants";

import difference from "@turf/difference";

import {
  passingModeName,
  highlightPropertyName,
  defaultOptions,
} from "./constants";

const CutPolygonMode = {};

CutPolygonMode.onSetup = function (opt) {
  const { 
    features,
    highlightColor = defaultOptions.highlightColor 
  } = opt || {};
  // console.log("--- CutPolygonMode.onSetup : ", features)
  const main = features || this.getSelected()
    .filter((f) => f.type === geojsonTypes.POLYGON || f.type === geojsonTypes.MULTI_POLYGON)
    .map((f) => f.toGeoJSON());

  // console.log("--- main : ", main, main?.[0]?.id)
  if (main.length < 1) {
    throw new Error(
      "Please select a feature/features (Polygon or MultiPolygon) to split!"
    );
  }

  const api = this._ctx.api;

  /// `onSetup` job should complete for this mode to work.
  /// so `setTimeout` is used to bupass mode change after `onSetup` is done executing.
  setTimeout(() => {
    this.changeMode(passingModeName, {
      onDraw: (cuttingpolygon) => {
        main.forEach((feature) => {
          if (
            feature.geometry.type === geojsonTypes.POLYGON ||
            feature.geometry.type === geojsonTypes.MULTI_POLYGON
          ) {
            const afterCut = difference(feature, cuttingpolygon);
            const newF = this.newFeature(afterCut);
            newF.id = feature.id;

            this.addFeature(newF);
            this.fireUpdate(newF);
          } else {
            console.info("The feature is not Polygon/MultiPolygon!");
          }
        });
        // console.log("---- this : ", this)
        this?._ctx?.api?.setActiveButton();
      },
      onCancel: () => {
        if (main?.[0]?.id)
          api.setFeatureProperty(main[0].id, highlightPropertyName, undefined);

        this?._ctx?.api?.setActiveButton();
      },
    });
  }, 500);

  if (main?.[0]?.id)
    api.setFeatureProperty(main[0].id, highlightPropertyName, highlightColor);

  return {
    main,
  };
};

CutPolygonMode.toDisplayFeatures = function (state, geojson, display) {
  display(geojson);
};

CutPolygonMode.fireUpdate = function (newF) {
  this.map.fire(events.UPDATE, {
    action: updateActions.CHANGE_COORDINATES,
    features: newF.toGeoJSON(),
  });
};

export default CutPolygonMode;
