import MapboxDraw from '@mapbox/mapbox-gl-draw';
// const Constants = require('./constants');

import * as Constants from '@mapbox/mapbox-gl-draw/src/constants';
// 
// const doubleClickZoom = require('@mapbox/mapbox-gl-draw/src/lib/double_click_zoom');
// import doubleClickZoom from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom'
// import { ConstructionOutlined } from '@mui/icons-material';
// const dragPan = require('../utils/drag_pan');
const circle = require('./@turf/circle').default;
const distance = require('@turf/distance').default;
const turfHelpers = require('@turf/helpers');
const mapboxgl = require('mapbox-gl');

const DragCircleMode = {...MapboxDraw.modes.draw_polygon};

// const dragPan = {
//     enable(ctx) {
//         setTimeout(() => {
//             // First check we've got a map and some context.
//             if (!ctx.map || !ctx.map.dragPan || !ctx._ctx || !ctx._ctx.store || !ctx._ctx.store.getInitialConfigValue) return;
//             // Now check initial state wasn't false (we leave it disabled if so)
//             if (!ctx._ctx.store.getInitialConfigValue('dragPan')) return;
//             ctx.map.dragPan.enable();
//         }, 0);
//     },
//     disable(ctx) {
//         setTimeout(() => {
//             if (!ctx.map || !ctx.map.doubleClickZoom) return;
//             // Always disable here, as it's necessary in some cases.
//             ctx.map.dragPan.disable();
//         }, 0);
//     }
// };

DragCircleMode.onSetup = function(opts) {
  const polygon = this.newFeature({
    type: Constants.geojsonTypes.FEATURE,
    properties: {
      isCircle: true,
      center: []
    },
    geometry: {
      type: Constants.geojsonTypes.POLYGON,
      coordinates: [[]]
    }
  });
//   this.updateUIClasses({ mouse: Constants.cursors.ADD });
//   console.log(polygon)
  this.addFeature(polygon);

  this.clearSelectedFeatures();
//   doubleClickZoom.disable(this);
//   dragPan.disable(this);
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.activateUIButton(Constants.types.POLYGON);
  this.setActionableState({
    trash: true
  });
  this.radiusPopupWindow = new mapboxgl.Popup({ closeButton: false, closeOnClick: true , anchor:"left"});


  return {
    polygon,
    currentVertexPosition: 0
  };
};

// DragCircleMode.onMouseDown = DragCircleMode.onTouchStart = function (state, e) {
    // console.log('onMouseDown',state)
//   const currentCenter = state.polygon.properties.center;
//   if (currentCenter.length === 0) {
//     state.polygon.properties.center = [e.lngLat.lng, e.lngLat.lat];
//   }
// };

// DragCircleMode.onDrag = 
DragCircleMode.onMouseMove = function (state, e) {
    // if (state.isVertex(e)) {
        this.updateUIClasses({ mouse: Constants.cursors.ADD });
    //   }
  const center = state.polygon.properties.center;
  if (center.length > 0) {
    const distanceInKm = distance(
      turfHelpers.point(center),
      turfHelpers.point([e.lngLat.lng, e.lngLat.lat]),
      { units : 'kilometers'});
    const circleFeature = circle(center, distanceInKm);
    // console.log('circleFeature',circleFeature)
    state.polygon.incomingCoords(circleFeature.geometry.coordinates);
    state.polygon.properties.radiusInKm = distanceInKm;
    this.radiusPopupWindow
      .setLngLat([e.lngLat.lng, e.lngLat.lat])
      .setHTML('<div style="margin-top:-8px;margin-bottom:-17px;">รัศมี：' + distanceInKm.toFixed(2) + 'km</div>')
      .addTo(this.map);
  }
};

// DragCircleMode.onMouseUp = DragCircleMode.onTouchEnd = function (state, e) {
//   dragPan.enable(this);
//   return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
// };

DragCircleMode.onClick = function (state, e) {
    // console.log('onClick',state)
    // this.updateUIClasses({ mouse: Constants.cursors.ADD });

  // don't draw the circle if its a tap or click event
//   state.polygon.properties.center = [];
    const currentCenter = state.polygon.properties.center;
    if (currentCenter.length === 0) {
    state.polygon.properties.center = [e.lngLat.lng, e.lngLat.lat];
    }
    else{
        this.radiusPopupWindow.remove()
        return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
    }
    this?._ctx?.api?.setActiveButton();
};

DragCircleMode.onTap = DragCircleMode.onClick;

DragCircleMode.toDisplayFeatures = function(state, geojson, display) {
    // console.log(geojson)
    // console.log(geojson.geometry.coordinates[0])

    if (geojson.geometry.coordinates[0][0]==undefined) {
        geojson.geometry.coordinates=[]
    }
    const centerPoint = {
        type: "Feature",
        properties: {
            id:geojson.properties.id
        },
        geometry: {
            type: 'Point',
            coordinates: state.polygon.properties.center
        }
    }
    // console.log(centerPoint)
  const isActivePolygon = geojson.properties.id === state.polygon.id;
  geojson.properties.active = (isActivePolygon) ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE;
//   const finalgeojson = {
//     type: "FeatureCollection",
//     features:[geojson,centerPoint],
//     properties:{
//         id:geojson.properties.id
//     }
//   }
// geojson.geometry.coordinates.push(state.polygon.properties.center)
//   console.log(display(centerPoint))
  return display(geojson);
};



export default DragCircleMode