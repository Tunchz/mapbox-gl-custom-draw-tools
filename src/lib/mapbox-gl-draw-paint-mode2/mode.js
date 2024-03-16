import * as doubleClickZoom from "./lib/double_click_zoom";
import * as Constants from "./lib/Constants";
import DrawPolygon from '@mapbox/mapbox-gl-draw/src/modes/draw_polygon';
import {geojsonTypes, cursors, types, updateActions, modes, events} from '@mapbox/mapbox-gl-draw/src/constants';
import simplify from "@turf/simplify";
// import "./icon/paint-brush.css";

const PaintMode = Object.assign({}, {toDisplayFeatures:DrawPolygon.toDisplayFeatures})

PaintMode.onSetup = function(opt) {
    console.log("==== PaintMode2.onSetup : ", opt)
  var state = {};
  state.isSimplify=opt?.simplify;
  state.polygon = {};
  state.features = [];
  state.currentLine = null;
  state.currentLineFeature = null;
  doubleClickZoom.disable(this);
  return state;
};

PaintMode.onTap = PaintMode.onClick = function (state, e) {
  if (e.originalEvent.detail === 2) {
    state.features.push(state.currentLine);
    state.currentLine = null;

    this.polygon = {
        type: "FeatureCollection",
  
        features: state.features.map((coordinates) => ({
          id: state.currentLineFeature.id,
          type: "Feature",
          properties: {},
          geometry: {
            type: "MultiLineString",
            coordinates: [coordinates],
          },
        })),
      }
    
    if (state.isSimplify) {
        try {
            this.simplify(state.currentLineFeature);
        } catch(err) {
            console.error(err);
        }
    }

    // this.map.fire("draw.create", this.polygon);

    this.fireUpdate();

    this.changeMode(Constants.modes.SIMPLE_SELECT);
    doubleClickZoom.disable(this);

    this?._ctx?.api?.setActiveButton();
  } else {
    state.currentLine = state.currentLine || [];
    state.currentLine.push([e.lngLat.lng, e.lngLat.lat]);
  }
};

PaintMode.onMouseMove = function (state, e) {
  if (!state.currentLine) return;

  state.currentLine.push([e.lngLat.lng, e.lngLat.lat]);

  if (!state.currentLineFeature) {
    state.currentLineFeature = this.newFeature({
      type: "Feature",
      properties: {},
      geometry: {
        type: "MultiLineString",
        coordinates: [state.currentLine],
      },
    });
    this.addFeature(state.currentLineFeature);
    // this.map.fire("draw.selectionchange", {
    //   featureIds: [state.currentLineFeature.id],
    // });
  } else {
    let updatedLineFeature = this.newFeature({
      type: "Feature",
      properties: {},
      geometry: {
        type: "MultiLineString",
        coordinates: [state.currentLine],
      },
    });
    this.deleteFeature(state.currentLineFeature.id);
    state.currentLineFeature = updatedLineFeature;
    this.addFeature(state.currentLineFeature);
    // this.map.fire("draw.selectionchange", {
    //   featureIds: [state.currentLineFeature.id],
    // });
  }
};

// PaintMode.toDisplayFeatures = function (state, geojson, display) {
//   display(geojson);
// };

PaintMode.fireUpdate = function() {
    this.map.fire(events.UPDATE, {
        action: updateActions.MOVE,
        features: this.getSelected().map(f => f.toGeoJSON())
    });
};

PaintMode.simplify = function(polygon) {
    // console.log("=== simplify before : ", polygon)
    const tolerance = 1 / Math.pow(1.05, 12 * this.map.getZoom()) // https://www.desmos.com/calculator/nolp0g6pwr
    polygon = simplify(polygon.features[0], {
        mutate: true,
        tolerance: tolerance,
        highQuality: true
    });
    // console.log("=== simplify after : ", polygon)
}

export default PaintMode;