import defaultStyle from '@mapbox/mapbox-gl-draw/src/lib/theme';
import { events } from '@mapbox/mapbox-gl-draw/src/constants';
import * as Constants from '@mapbox/mapbox-gl-draw/src/constants';
import Union from '@turf/union';
import Buffer from '@turf/buffer';
import Length from '@turf/length';
import Area from '@turf/area';
import Centroid from '@turf/centroid';
import * as meta from '@turf/meta';
import * as helpers from '@turf/helpers';
import transformTranslate from '@turf/transform-translate';

require('./draw-additional-tools.css');

let measurement = {
  length: [],
  area: [],
};

const addToolStyle = [
  ...defaultStyle,
  {
    id: 'gl-draw-line-active-length',
    type: 'symbol',
    filter: ['all', ['==', '$type', 'LineString'], ['==', 'active', 'true'], ['==', 'user_has_length', 'true']],
    layout: {
      'symbol-placement': 'line-center',
      'text-rotation-alignment': 'map',
      'text-pitch-alignment': 'viewport',
      'text-max-angle': 30,
      'text-max-width': 300,
      'text-field': '{user_length} {user_length_unit}',
      'text-font': ['IranSans-Noto'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 8, 8, 10, 12, 16, 16],
      'text-allow-overlap': false,
    },
    paint: {
      'text-opacity': ['interpolate', ['linear'], ['zoom'], 8, 1],
      'text-color': '#000',
      'text-halo-color': ['interpolate', ['linear'], ['zoom'], 2, '#ffffff', 3, '#ffffff'],
      'text-halo-width': 0.3,
      'text-halo-blur': 1,
    },
  },
  {
    id: 'gl-draw-polygon-active-length',
    type: 'symbol',
    filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true'], ['==', 'user_has_length', 'true']],
    layout: {
      'symbol-placement': 'line-center',
      'text-rotation-alignment': 'map',
      'text-pitch-alignment': 'viewport',
      'text-max-angle': 30,
      'text-max-width': 300,
      'text-field': '{user_length} {user_length_unit}',
      'text-font': ['IranSans-Noto'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 8, 8, 10, 12, 16, 16],
      'text-allow-overlap': false,
    },
    paint: {
      'text-opacity': ['interpolate', ['linear'], ['zoom'], 8, 1],
      'text-color': '#000',
      'text-halo-color': ['interpolate', ['linear'], ['zoom'], 2, '#ffffff', 3, '#ffffff'],
      'text-halo-width': 0.3,
      'text-halo-blur': 1,
    },
  },
  {
    id: 'gl-draw-polygon-active-area',
    type: 'symbol',
    filter: ['all', ['==', '$type', 'Polygon'], ['==', 'active', 'true'], ['==', 'user_has_area', 'true']],
    layout: {
      'symbol-placement': 'line',
      'text-rotation-alignment': 'map',
      'text-pitch-alignment': 'viewport',
      'text-max-angle': 30,
      'text-max-width': 300,
      'text-field': '{user_area} meters^2',
      'text-font': ['IranSans-Noto'],
      'text-size': ['interpolate', ['linear'], ['zoom'], 8, 8, 10, 12, 16, 16],
      'text-allow-overlap': false,
    },
    paint: {
      'text-opacity': ['interpolate', ['linear'], ['zoom'], 8, 1],
      'text-color': '#000',
      'text-halo-color': ['interpolate', ['linear'], ['zoom'], 2, '#ffffff', 3, '#ffffff'],
      'text-halo-width': 0.3,
      'text-halo-blur': 1,
    },
  },
];
class extendDrawBar {
  constructor(opt) {
    console.log("---- opt.draw : ",opt.draw)
    this.draw = opt.draw;
    this.onRemoveOrig = opt.draw.onRemove;
    // this.addButton = opt.draw.addButton;
    // this.removeButton = opt.draw.removeButton;
    const { union, copy, cut, buffer, length, area, centroid } = this.draw.options;
    this.initialOptions = { union, copy, cut, buffer, length, area, centroid };
    this.disabledActiveList = { union:true, copy:true, cut:true, buffer:true, length:true, area:true, centroid:true, polygontopoints:true, linetopoints:true };

    this.buttons = [
      {
        on: 'click',
        name: 'Centroid',
        action: this.centroidPolygons,
        title: `Centroid tool`,
        classes: ['mapbox-gl-draw_centroid', opt.classPrefix ? `${opt.classPrefix}-centroid` : null],
        disabled: this.draw?.controls?.centroid==false,
      },
      {
        on: 'click',
        name: 'PolygonToPoints',
        action: this.toPoints,
        title: `PolygonToPoints tool`,
        classes: ['mapbox-gl-draw_poly_to_points', opt.classPrefix ? `${opt.classPrefix}-poly_to_points` : null],
        disabled: this.draw?.controls?.polygon_to_points==false,
      },
      {
        on: 'click',
        name: 'LineToPoints',
        action: this.toPoints,
        title: `LineToPoints tool`,
        classes: ['mapbox-gl-draw_line_to_points', opt.classPrefix ? `${opt.classPrefix}-line_to_points` : null],
        disabled: this.draw?.controls?.line_to_points==false,
      },
      {
        on: 'click',
        name: 'Union',
        action: this.unionPolygons,
        title: `Union tool`,
        classes: ['mapbox-gl-draw_union', opt.classPrefix ? `${opt.classPrefix}-union` : null],
        disabled: this.draw?.controls?.union==false,
      },
      {
        on: 'click',
        name: 'Buffer',
        action: this.bufferFeature,
        title: `Buffer tool`,
        classes: ['mapbox-gl-draw_buffer', opt.classPrefix ? `${opt.classPrefix}-buffer` : null],
        disabled: this.draw?.controls?.buffer==false,
      },
      {
        on: 'click',
        name: 'Copy',
        action: this.copyFeature,
        title: `Copy tool`,
        classes: ['mapbox-gl-draw_copy', opt.classPrefix ? `${opt.classPrefix}-copy` : null],
        disabled: this.draw?.controls?.copy==false,
      },
      // {
      //   on: 'click',
      //   name: 'Cut',
      //   action: this.cutFeature,
      //   title: `Cut tool`,
      //   classes: ['mapbox-gl-draw_cut', opt.classPrefix ? `${opt.classPrefix}-cut` : null],
      // },
      {
        on: 'click',
        name: 'Length',
        action: this.lengthOfFeature,
        title: `Length tool`,
        classes: ['mapbox-gl-draw_length', opt.classPrefix ? `${opt.classPrefix}-length` : null],
        disabled: this.draw?.controls?.length==false,
      },
      {
        on: 'click',
        name: 'Area',
        action: this.areaOfPolygon,
        title: `Area tool`,
        classes: ['mapbox-gl-draw_area', opt.classPrefix ? `${opt.classPrefix}-area` : null],
        disabled: this.draw?.controls?.area==false,
      },
    ];
  }

  onAdd(map) {
    this.map = map;
    this._container = document.createElement('div');
    // this._container.className = 'mapboxgl-ctrl-group mapboxgl-ctrl';
    console.log("==== this.draw.options : ", this.draw.options)
    this._container.className = `mapboxgl-ctrl-group mapboxgl-ctrl custom-tools-group${this.draw.options.horizontal?" horizontal":""} ${this.draw.options.edge}`;
    this.elContainer = this._container;
    this.draw.groups_item&&this.draw.groups_item.push(this.elContainer)
    this.buttons
      .filter((button) => this.initialOptions[button.name.toLowerCase()] !== false)
      .forEach((b) => {
        !b.disabled&&this.addButton(b);
      });
    return this._container;
  }

  onRemove(map) {
    this.buttons
      .filter((button) => this.initialOptions[button.name.toLowerCase()] !== false)
      .forEach((b) => {
        this.removeButton(b);
      });
    this.onRemoveOrig(map);
  }

  // addButton(opt) {
  //   var elButton = document.createElement('button');
  //   elButton.className = 'mapbox-gl-draw_ctrl-draw-btn';
  //   elButton.setAttribute('title', opt.title);
  //   if (opt.classes instanceof Array) {
  //     opt.classes.forEach((c) => {
  //       elButton.classList.add(c);
  //     });
  //   }
  //   elButton.addEventListener('click', opt.callback.bind(this));
  //   this.elContainer.appendChild(elButton);
  //   opt.elButton = elButton;
  // }


  // removeButton(opt) {
  //   opt.elButton.removeEventListener('click', opt.action);
  //   opt.elButton.remove();
  // }


  addButton = (opt) => {
    let this_ = this.draw
    // console.log("--- this : ", this, this_)
    var elButton = document.createElement('button');
    elButton.className = 'mapbox-gl-draw_ctrl-draw-btn';
    elButton.setAttribute('title', opt.title);
    if (opt.classes instanceof Array) {
      opt.classes.forEach((c) => {
        elButton.classList.add(c);
      });
    }
    if (opt.id) {
      elButton.id = opt.id;
    }
    elButton.cancel = opt.cancel
    elButton.addEventListener(opt.on, (e)=>{
      e.preventDefault();
      e.stopPropagation();
      const clickedButton = e.target;
      if (clickedButton === this_.activeButton) {
        // elButton?.classList?.remove("active")
        this_.deactivateButtons();
        return;
      }
      // elButton?.classList?.add("active")
      this.setActiveButton(opt.title, opt.name)
      opt.action(this)
    }, true);
    let elButton_ = opt.customize_button?opt.customize_button(elButton):elButton;

    this.elContainer.appendChild(elButton_);

    opt.elButton = elButton;
    if (!this_.buttonElements) {
      this_.buttonElements = {[opt.title]:opt.elButton}
    } else {
      this_.buttonElements[opt.title]=opt.elButton
    }
  };


  deactivateButtons = () => {
    let this_ = this.draw
    if (!this_.activeButton) return;
    this_.activeButton.classList.remove(Constants.classes.ACTIVE_BUTTON);
    this_.activeButton.cancel&&this_.activeButton.cancel()
    this_.activeButton = null;
  }

  setActiveButton = (id, name) => {
    let this_ = this.draw
    this_.curActiveButton = id
    this.deactivateButtons();

    const button = this_.buttonElements[id];
    if (!button) return;
    console.log("===== ",id, name , this.initialOptions[name.toLowerCase()])
    if (button && !['Trash', 'Combine', 'Uncombine'].includes(id) && !this.disabledActiveList[name.toLowerCase()]) {
      button.classList.add(Constants.classes.ACTIVE_BUTTON);
      this_.activeButton = button;
    }
  }


  removeButton = (opt) => {
    opt.elButton.removeEventListener(opt.on, opt.action);
    opt.elButton.remove();
  };


  centroidPolygons(this_) {
    // console.log("==== this : ", this.draw || draw)
    const selectedFeatures = (this_.draw||draw).getSelected().features;
    if (!selectedFeatures.length) return;

    const ids = [];
    const centroids = [];
    selectedFeatures.forEach((main) => {
      if (main.geometry.type !== 'Polygon') return;
      const centroid = Centroid(main.geometry);
      centroid.id = `${main.id}_centroid_${Math.floor(Math.random() * Math.floor(1000))}`;
      ids.push(centroid.id);
      centroids.push(centroid);
      (this_.draw||draw).add(centroid);
    });
    console.log("---- this : ", this)
    this_.fireCreateCentroid(centroids);
    (this_.draw||draw).changeMode('simple_select', { featureIds: ids });
  }

  toPoints(this_) {
    const selectedFeatures = (this_.draw||draw).getSelected()?.features;
    // console.log((this_.draw||draw).getSelected());
    if (!selectedFeatures.length) return;
    let ids = [];
    let vertices = [];
    selectedFeatures.forEach((main) => {
      if (['Point', 'MultiPoint'].includes(main.geometry.type)) return;
      let vertex = helpers.multiPoint(meta.coordAll(main.geometry));
      vertex.id = `${main.id}_vertex_${Math.floor(Math.random() * Math.floor(1000))}`;
      ids.push(vertex.id);
      vertices.push(vertex);
      // console.log(vertices);
      (this_.draw||draw).add({type: 'FeatureCollection', features: vertices});
    });
    this_.fireCreateVertcies(vertices);
    (this_.draw||draw).changeMode('simple_select', { featureIds: ids });
  }

  unionPolygons(this_) {
    const selectedFeatures = (this_.draw||draw).getSelected().features;
    if (!selectedFeatures.length) return;
    let unionPoly;
    try {
      unionPoly = Union(...(this_.draw||draw).getSelected().features);
    } catch (err) {
      throw new Error(err);
    }
    if (unionPoly.geometry.type === 'GeometryCollection')
      throw new Error('Selected Features must have the same types!');
    let ids = selectedFeatures.map((i) => i.id);
    (this_.draw||draw).delete(ids);
    unionPoly.id = ids.join('-');
    console.log("--- unionPoly : ", unionPoly);
    (this_.draw||draw).add(unionPoly);
    this_.fireCreateUnion(unionPoly);
    (this_.draw||draw).changeMode('simple_select', { featureIds: [unionPoly.id] });
  }

  bufferFeature(this_) {
    const selectedFeatures = (this_.draw||draw).getSelected().features;
    if (!selectedFeatures.length) return;
    const bufferOptions = {};
    bufferOptions.units = (this_.draw||draw).options.bufferUnits || 'kilometers';
    bufferOptions.steps = (this_.draw||draw).options.bufferSteps || '64';
    let ids = [];
    let buffers = [];
    selectedFeatures.forEach((main) => {
      let buffered = Buffer(main, (this_.draw||draw).options.bufferSize || 0.5, bufferOptions);
      buffered.id = `${main.id}_buffer_${Math.floor(Math.random() * Math.floor(1000))}`;
      ids.push(buffered.id);
      buffers.push(buffered);
      (this_.draw||draw).add(buffered);
    });
    this_.fireCreateBuffer(buffers);
    (this_.draw||draw).changeMode('simple_select', { featureIds: ids });
  }

  copyFeature(this_) {
    const selectedFeatures = (this_.draw||draw).getSelected().features;
    if (!selectedFeatures.length) return;
    let ids = [];
    let translated = [];
    selectedFeatures.forEach((main) => {
      var translatedPoly = transformTranslate(main, 2, 35);
      translatedPoly.id = `${main.id}_copy_${Math.floor(Math.random() * Math.floor(1000))}`;
      ids.push(translatedPoly.id);
      translated.push(translatedPoly);
      (this_.draw||draw).add(translatedPoly);
    });
    this_.fireUpdateCopy(translated);
    (this_.draw||draw).changeMode('simple_select', { featureIds: ids });
  }

  cutFeature(this_) {
    const selectedFeatures = (this_.draw||draw).getSelected().features;
    if (!selectedFeatures.length) return;
    let ids = [];
    let cuts = [];
    selectedFeatures.forEach((main) => {
      var cutPoly = transformTranslate(main, 2, 35);
      cutPoly.id = `${main.id}_cut_${Math.floor(Math.random() * Math.floor(1000))}`;
      ids.push(cutPoly.id);
      cuts.push(cutPoly);
      (this_.draw||draw).add(cuts);
    });
    this_.fireUpdateCut(cuts);
    (this_.draw||draw).changeMode('simple_select', { featureIds: ids });
  }

  lengthOfFeature(this_) {
    measurement.length = [];
    const selectedFeatures = (this_.draw||draw).getSelected().features;
    if (!selectedFeatures.length) return;
    selectedFeatures.forEach((main, idx) => {
      let length = Length(main, { units: (this_.draw||draw).options.lengthUnits || 'kilometers' });
      measurement.length.push({ id: main.id, value: length });
      ((this_.draw||draw).options.showLength || true) &&
        (this_.draw||draw).setFeatureProperty(main.id, 'has_length', 'true') &&
        (this_.draw||draw).setFeatureProperty(main.id, 'length', parseFloat(length).toFixed(4)) &&
        (this_.draw||draw).setFeatureProperty(main.id, 'length_unit', (this_.draw||draw).options.lengthUnits || 'kilometers');
    });
    this_.fireUpdateMeasurement(measurement.length, 'length');
  }

  areaOfPolygon(this_) {
    measurement.area = [];
    const selectedFeatures = (this_.draw||draw).getSelected().features;
    if (!selectedFeatures.length) return;
    selectedFeatures.forEach((main, idx) => {
      let area = Area(main);
      measurement.area.push({ id: main.id, value: area });
      ((this_.draw||draw).options.showArea || true) &&
        (this_.draw||draw).setFeatureProperty(main.id, 'has_area', 'true') &&
        (this_.draw||draw).setFeatureProperty(main.id, 'area', parseFloat(area).toFixed(4));
    });
    this_.fireUpdateMeasurement(measurement.area, 'area');
  }

  fireCreateCentroid(newF) {
    console.log("---- this : ", this)
    this.map.fire(events.CREATE, {
      action: 'CentroidPolygon',
      features: newF,
    });
  }
  fireCreateVertcies(newF) {
    this.map.fire(events.CREATE, {
      action: 'toPoints',
      features: newF,
    });
  }
  fireCreateUnion(newF) {
    this.map.fire(events.CREATE, {
      action: 'UnionPolygon',
      features: newF,
    });
  }
  fireCreateBuffer(newF) {
    this.map.fire(events.CREATE, {
      action: 'Buffer',
      features: newF,
    });
  }
  fireUpdateCopy(newF) {
    this.map.fire(events.UPDATE, {
      action: 'Copy',
      features: newF,
    });
  }
  fireUpdateCut(newF) {
    this.map.fire(events.UPDATE, {
      action: 'Cut',
      features: newF,
    });
  }
  fireUpdateMeasurement(newF, type) {
    this.map.fire(events.UPDATE, {
      action: 'Measurement-' + type,
      features: newF,
    });
  }
}

/*
options
------
{
    union: true,
    copy: true,
    buffer: true,
    length: true,
    area: true,
    bufferSize: 500,
    bufferUnit: 'kilometers',
    bufferSteps: 64,
    lengthUnit: 'kilometers',
    showLength: true,
    showArea: true
}
*/

const additionalTools = (draw, classPrefix) =>
  new extendDrawBar({
    draw,
    classPrefix,
  });

export { additionalTools, measurement, addToolStyle };
