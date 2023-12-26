import { geojsonTypes, modes, events, updateActions } from "@mapbox/mapbox-gl-draw/src/constants";
import lineSplit from "@turf/line-split";
import combine from "@turf/combine";
import flatten from "@turf/flatten";
import { featureCollection } from "@turf/helpers";

const SplitLineMode = {
  onSetup: function ({ spliter, features }) {
    // let main = this.getSelected().map((f) => f.toGeoJSON());


    console.log("---- SplitLineMode.onSetup : ", features)

    if (features.length !== 0) {
      main = features
          .filter(
            (f) =>
              f.geometry?.type === geojsonTypes.LINE_STRING ||
              f.geometry?.type === geojsonTypes.MULTI_LINE_STRING
          )
    } else {
        selectedFeatures = this.getSelected();
        console.log("--- this.getSelected() : ", selectedFeatures)
       if (selectedFeatures.length !== 0) {

        main = selectedFeatures
          .filter(
            (f) =>
              f.type === geojsonTypes.LINE_STRING ||
              f.type === geojsonTypes.MULTI_LINE_STRING
          )
          .map((f) => f.toGeoJSON())
      }
    }

    if (main.length < 1)
      throw new Error("Please select a Linestring/MultiLinestring!");
    const state = {
      main,
      spliter: `passing_mode_${spliter}`,
    };
    return state;
  },

  toDisplayFeatures: function (state, geojson, display) {
    console.log("---- SplitLineMode.toDisplayFeatures : ", state, geojson, display)
    display(geojson);
    // this.changeMode(state.spliter, (cut) => {
    //   console.log("---- cut : ", cut)
    //   state.main.forEach((mainFeature, idx) => {
    //     const splitedFeatures = [];
    //     flatten(mainFeature).features.forEach((feature) => {
    //       if (
    //         feature.geometry.type === geojsonTypes.LINE_STRING ||
    //         feature.geometry.type === geojsonTypes.MULTI_LINE_STRING
    //       ) {
    //         const afterCut = lineSplit(feature, cut);
    //         if (afterCut.features.length < 1)
    //           splitedFeatures.push(featureCollection([feature]));
    //         else splitedFeatures.push(afterCut);
    //       } else {
    //         throw new Error("The feature is not Linestring/MultiLinestring!");
    //       }
    //     });

    //     const collected = featureCollection(
    //       splitedFeatures.flatMap((featureColl) => featureColl.features)
    //     );
    //     const afterCutMultiLineString = combine(collected).features[0];
    //     afterCutMultiLineString.id = mainFeature.id;
    //     this._ctx.api.add(afterCutMultiLineString);
    //     this.fireUpdate(afterCutMultiLineString)
    //   });
    // });
    try {
      this.changeMode(state.spliter, {
        onDraw: (cut) => {    
          console.log("---- cut : ", cut)
          state.main.forEach((mainFeature, idx) => {
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
            this.fireUpdate(afterCutMultiLineString)
          });
        },
        onCancel: () => {
          /// ...
        },
      });
    } catch (err) {
      console.error("🚀 ~ file: index.js ~ line 84 ~ err", err);
    }
  },

  fireUpdate: function(newF) {
    this.map.fire(events.UPDATE, {
        action: 'SplitLine',
        features: newF
    });
  }
};

export default SplitLineMode;
