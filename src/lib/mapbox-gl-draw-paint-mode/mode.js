import DrawPolygon from '@mapbox/mapbox-gl-draw/src/modes/draw_polygon';
import {geojsonTypes, cursors, types, updateActions, modes, events} from '@mapbox/mapbox-gl-draw/src/constants';
// import simplify from "@turf/simplify";
// import "./icon/paint-brush.css";

const PaintMode = Object.assign({}, DrawPolygon)

PaintMode.onSetup = function() {
    console.log("==== PaintMode.onSetup")
    const polygon = this.newFeature({
        type: geojsonTypes.FEATURE,
        properties: {},
        geometry: {
            type: "MultiLineString",//geojsonTypes.POLYGON,
            coordinates: [[]]
        }
    });

    this.addFeature(polygon);
    this.clearSelectedFeatures();
    
    // disable dragPan
    setTimeout(() => {
        if (!this.map || !this.map.dragPan) return;
        this.map.dragPan.disable();
    }, 0);

    this.updateUIClasses({ mouse: cursors.ADD });
    this.activateUIButton(types.LINE);
    this.setActionableState({
        trash: true
    });

    return {
        polygon,
        currentVertexPosition: 0,
        dragMoving: false
    };
};

PaintMode.onDrag = PaintMode.onTouchMove = function (state, e){
    state.dragMoving = true;
    this.updateUIClasses({ mouse: cursors.ADD });
    state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, e.lngLat.lng, e.lngLat.lat);
    state.currentVertexPosition++;
    state.polygon.updateCoordinate(`0.${state.currentVertexPosition}`, e.lngLat.lng, e.lngLat.lat);
}

PaintMode.onMouseUp = function (state, e){
    if (state.dragMoving) {
        // this.simplify(state.polygon);
        this.fireUpdate();
        this.changeMode(modes.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
        this.changeMode("draw_paint_mode");
        // this.onSetup();
    }
}

PaintMode.onTouchEnd = function(state, e) {
    this.onMouseUp(state, e)
}

PaintMode.fireUpdate = function() {
    this.map.fire(events.UPDATE, {
        action: updateActions.MOVE,
        features: this.getSelected().map(f => f.toGeoJSON())
    });
};

// PaintMode.simplify = function(polygon) {
//   const tolerance = 1 / Math.pow(1.05, 10 * this.map.getZoom()) // https://www.desmos.com/calculator/nolp0g6pwr
//   simplify(polygon, {
//       mutate: true,
//       tolerance: tolerance,
//       highQuality: true
//   });
// }

export default PaintMode
