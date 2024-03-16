import DrawPolygon from '@mapbox/mapbox-gl-draw/src/modes/draw_polygon';
import {geojsonTypes, cursors, types, updateActions, modes, events} from '@mapbox/mapbox-gl-draw/src/constants';
import simplify from "@turf/simplify";
// import "./icon/paint-brush.css";

const PaintMode = Object.assign({}, {toDisplayFeatures:DrawPolygon.toDisplayFeatures})

PaintMode.onSetup = function(opt) {
    console.log("==== PaintMode.onSetup : ", opt)
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
    // this.activateUIButton(types.LINE);
    this.setActionableState({
        trash: true
    });

    return {
        polygon,
        currentVertexPosition: 0,
        dragMoving: false,
        isSimplify: opt?.simplify,
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
    
        if (state.isSimplify) {
            try {
                this.simplify(state.polygon);
            } catch(err) {
                console.error(err);
            }
        }
        this.fireUpdate();
        this.changeMode(modes.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
        // this.changeMode("draw_paint_mode");
    }

    this?._ctx?.api?.setActiveButton();
    // this?._ctx?.api?.deactiveButton();
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

PaintMode.simplify = function(polygon) {
//   console.log("=== simplify before : ", polygon)
  const tolerance = 1 / Math.pow(1.05, 12 * this.map.getZoom()) // https://www.desmos.com/calculator/nolp0g6pwr
  polygon = simplify(polygon.features[0], {
      mutate: true,
      tolerance: tolerance,
      highQuality: true
  });
//   console.log("=== simplify after : ", polygon)
}

export default PaintMode
