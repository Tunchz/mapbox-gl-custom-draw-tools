import MapboxDraw from '@mapbox/mapbox-gl-draw';
import * as Constants from '@mapbox/mapbox-gl-draw/src/constants';
import doubleClickZoom from '../utils/double_click_zoom';
import dragPan from '../utils/drag_pan';
const ellipse = require('./@turf/ellipse').default;
const distance = require('@turf/distance').default;
const turfHelpers = require('@turf/helpers');
const mapboxgl = require('mapbox-gl');

const DragCircleMode = {...MapboxDraw.modes.draw_polygon};

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

  this.addFeature(polygon);

  this.clearSelectedFeatures();
  doubleClickZoom.disable(this);
  dragPan.disable(this);
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  this.activateUIButton(Constants.types.POLYGON);
  this.setActionableState({
    trash: true
  });
  this.radiusPopupWindow = new mapboxgl.Popup({ closeButton: false, closeOnClick: true , anchor:"left", offset: 20});

  return {
    polygon,
    currentVertexPosition: 0
  };
};

DragCircleMode.onMouseDown = DragCircleMode.onTouchStart = function (state, e) {
  const currentCenter = state.polygon.properties.center;
  if (currentCenter.length === 0) {
    state.polygon.properties.center = [e.lngLat.lng, e.lngLat.lat];
    if (localStorage.getItem("useCustomActiveDrawStyle")=='1') {
      state.polygon.properties.portColor = localStorage.getItem("customDrawCurrentColor") || localStorage.getItem("customDrawDefaultColor");
    }
  }
};

DragCircleMode.onDrag = DragCircleMode.onMouseMove = function (state, e) {
  this.updateUIClasses({ mouse: Constants.cursors.ADD });
  const center = state.polygon.properties.center;
  if (center.length > 0) {
    const distanceXInKm = distance(
      turfHelpers.point(center),
      turfHelpers.point([e.lngLat.lng, center[1]]),
      { units : 'kilometers'});
    const distanceYInKm = distance(
      turfHelpers.point(center),
      turfHelpers.point([center[0], e.lngLat.lat]),
      { units : 'kilometers'});
    
    const options = { angle: 0 };
    if (!distanceXInKm || !distanceYInKm) return;
      const ellipseFeature = ellipse(center, distanceXInKm, distanceYInKm, options);
    state.polygon.incomingCoords(ellipseFeature.geometry.coordinates);
    state.polygon.properties.radiusXInKm = distanceXInKm;
    state.polygon.properties.radiusYInKm = distanceYInKm;

    this.radiusPopupWindow
      .setLngLat([e.lngLat.lng, e.lngLat.lat])
      .setHTML('<div class="rec-tooltip" style="color:#000000;">รัศมี X ：' + distanceXInKm.toFixed(2) + 'km<br>รัศมี Y ：' + distanceYInKm.toFixed(2) + 'km</div>')
      .addTo(this.map);
  }
};

DragCircleMode.onMouseUp = DragCircleMode.onTouchEnd = function (state, e) {
  doubleClickZoom.enable(this);
  dragPan.enable(this);
  this.radiusPopupWindow.remove()
  return this.changeMode(Constants.modes.SIMPLE_SELECT, { featureIds: [state.polygon.id] });
};

DragCircleMode.onClick = DragCircleMode.onTap = function (state, e) {
  // don't draw the circle if its a tap or click event
  state.polygon.properties.center = [];
};

DragCircleMode.toDisplayFeatures = function(state, geojson, display) {
  if (geojson.geometry.coordinates[0][0]==undefined) {
    geojson.geometry.coordinates=[]
  }
  const isActivePolygon = geojson.properties.id === state.polygon.id;
  geojson.properties.active = (isActivePolygon) ? Constants.activeStates.ACTIVE : Constants.activeStates.INACTIVE;
  return display(geojson);
};

export default DragCircleMode;