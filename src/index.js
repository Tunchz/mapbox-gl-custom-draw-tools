import MapboxDraw from '@mapbox/mapbox-gl-draw';
import defaultDrawStyle from '@mapbox/mapbox-gl-draw/src/lib/theme';
import unionBy from 'lodash.unionby';
import SelectFeatureMode, { drawStyles as selectFeatureDrawStyles } from 'mapbox-gl-draw-select-mode';
import { SnapPolygonMode, SnapPointMode, SnapLineMode, SnapModeDrawStyles } from 'mapbox-gl-draw-snap-mode';
import mapboxGlDrawPinningMode from 'mapbox-gl-draw-pinning-mode';
import * as mapboxGlDrawPassingMode from 'mapbox-gl-draw-passing-mode';
// import mapboxGlDrawPassingMode from 'mapbox-gl-draw-passing-mode';
// import { SRMode, SRCenter, SRStyle } from 'mapbox-gl-draw-scale-rotate-mode';
import { SRMode, SRCenter, SRStyle } from './lib/mapbox-gl-draw-scale-rotate-mode';
import SplitPolygonMode, { drawStyles as splitPolygonDrawStyles } from 'mapbox-gl-draw-split-polygon-mode';
import CutPolygonMode, { drawStyles as cutPolygonDrawStyles } from 'mapbox-gl-draw-cut-polygon-mode';
import SplitLineMode from 'mapbox-gl-draw-split-line-mode';
import FreehandMode from 'mapbox-gl-draw-freehand-mode';
import DrawRectangle, { DrawStyles as RectRestrictStyles } from 'mapbox-gl-draw-rectangle-restrict-area';
import DrawRectangleAssisted from '@geostarters/mapbox-gl-draw-rectangle-assisted-mode';
import { additionalTools, measurement, addToolStyle } from 'mapbox-gl-draw-additional-tools';

// import MapboxCircle from 'mapbox-gl-circle';
const MapboxCircle = require('mapbox-gl-circle');
import './index.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

class SnapOptionsToolbar {
  constructor(opt) {
    let ctrl = this;
    ctrl.checkboxes = opt.checkboxes || [];
    ctrl.onRemoveOrig = opt.draw.onRemove;
    ctrl.horizontal = opt.draw.options?.horizontal;
  }
  onAdd(map) {
    let ctrl = this;
    ctrl.map = map;
    ctrl._container = document.createElement('div');
    ctrl._container.className = `mapboxgl-ctrl-group mapboxgl-ctrl${ctrl.horizontal?" horizontal":""}`;
    ctrl.elContainer = ctrl._container;
    ctrl.checkboxes.forEach((b) => {
      ctrl.addCheckbox(b);
    });
    return ctrl._container;
  }
  onRemove(map) {
    ctrl.checkboxes.forEach((b) => {
      ctrl.removeButton(b);
    });
    ctrl.onRemoveOrig(map);
  }
  addCheckbox(opt) {
    let ctrl = this;
    var elCheckbox = document.createElement('input');
    elCheckbox.setAttribute('type', 'checkbox');
    elCheckbox.setAttribute('title', opt.title);
    elCheckbox.checked = opt.initialState === 'checked';
    elCheckbox.className = 'mapbox-gl-draw_ctrl-draw-btn';
    if (opt.classes instanceof Array) {
      opt.classes.forEach((c) => {
        elCheckbox.classList.add(c);
      });
    }
    elCheckbox.addEventListener(opt.on, opt.action);
    ctrl.elContainer.appendChild(elCheckbox);
    opt.elCheckbox = elCheckbox;
  }
  removeButton(opt) {
    opt.elCheckbox.removeEventListener(opt.on, opt.action);
    opt.elCheckbox.remove();
  }
}

export default class MapboxDrawPro extends MapboxDraw {

  
  constructor(options) {
    options = options || {};
    const { modes, styles, controls, otherOtions, ...other } = options;


    // const [isTypeMenuActive, setIsTypeMenuActive] = useState(false);
    // const openMenu = () => {
    //   setIsTypeMenuActive(true);
    // };

    const customModes = {
      // ...MapboxDraw.modes,
      ...CutPolygonMode(SplitPolygonMode(SelectFeatureMode(MapboxDraw.modes))),
      draw_point: SnapPointMode,
      draw_polygon: SnapPolygonMode,
      draw_line_string: SnapLineMode,
      pinning_mode: mapboxGlDrawPinningMode,
      splitLineMode: SplitLineMode,
      passing_mode_point: mapboxGlDrawPassingMode.passing_draw_point,
      passing_mode_line_string: mapboxGlDrawPassingMode.passing_draw_line_string,
      passing_mode_polygon: mapboxGlDrawPassingMode.passing_draw_polygon,
      // passing_mode_point: mapboxGlDrawPassingMode(MapboxDraw.modes.draw_point),
      // passing_mode_line_string: mapboxGlDrawPassingMode(MapboxDraw.modes.draw_line_string),
      // passing_mode_polygon: mapboxGlDrawPassingMode(MapboxDraw.modes.draw_polygon),
      scaleRotateMode: SRMode,
      splitLineMode: SplitLineMode,
      freehandMode: FreehandMode,
      draw_rectangle: DrawRectangle,
      draw_rectangle_assisted: DrawRectangleAssisted,
    };

    const customOptions = {
      bufferSize: 0.5,
      bufferUnit: 'kilometers',
      bufferSteps: 64,
      snap: false,
      // snapOptions: {
      //   snapPx: 15,
      //   snapToMidPoints: true,
      // },
      guides: false,
      userProperties: true,
      ...other,
      displayControlsDefault: false,
    };

    // {
    //   displayControlsDefault: false,
    //   controls: {
    //     polygon: true,
    //     point: true,
    //     line_string: true,
    //     // trash: true,
    //   },
    //   userProperties: true,
    // }

    const _controls = {...controls, line_string:true, polygon:true, point:true, combine:false, uncombine:false, trash:false}

    const _modes = { ...customModes, ...modes };
    const __styles = [...cutPolygonDrawStyles(splitPolygonDrawStyles(selectFeatureDrawStyles(defaultDrawStyle)))];
    const _styles = unionBy(__styles, styles, RectRestrictStyles, SnapModeDrawStyles, SRStyle, addToolStyle, 'id');
    const _options = { modes: _modes, styles: _styles, controls:_controls, ...customOptions, ...otherOtions };
    super(_options);


    this.buttons = [
    
      // {
      //   //===== Circle
      //   on: 'click',
      //   action: (map) => {
      //     this.map.getCanvas().style.cursor = 'pointer';
      //     this.map.once('click', (e) => {
      //       this.map.getCanvas().style.cursor = '';
      //       var myCircle = new MapboxCircle(e.lngLat, 250, {
      //         editable: false,
      //         fillColor: '#3bb2d0',
      //         fillOpacity: 0.1,
      //         strokeColor: '#3bb2d0',
      //         strokeWeight: 2,
      //       }).addTo(this.map);
      //       myCircle.on('click', (mapMouseEvent) => {
      //         myCircle.remove();
      //         if (!myCircle.options.editable) {
      //           myCircle.options.editable = true;
      //           myCircle.options.fillColor = '#fbb03b';
      //           myCircle.options.strokeColor = '#fbb03b';
      //         } else {
      //           myCircle.options.editable = false;
      //           myCircle.options.fillColor = '#3bb2d0';
      //           myCircle.options.strokeColor = '#3bb2d0';
      //         }
      //         myCircle._updateCircle(); // <-- this re-initializes internal values of the circle
      //         myCircle.addTo(this.map);
      //       });
      //       myCircle.on('centerchanged', (circleObj) => {
      //         myCircle.remove();
      //         myCircle.options.editable = false;
      //         myCircle.options.fillColor = '#3bb2d0';
      //         myCircle.options.strokeColor = '#3bb2d0';
      //         myCircle._updateCircle(); // <-- this re-initializes internal values of the circle
      //         myCircle.addTo(this.map);
      //       });
      //       myCircle.on('radiuschanged', (circleObj) => {
      //         myCircle.remove();
      //         myCircle.options.editable = false;
      //         myCircle.options.fillColor = '#3bb2d0';
      //         myCircle.options.strokeColor = '#3bb2d0';
      //         myCircle._updateCircle(); // <-- this re-initializes internal values of the circle
      //         myCircle.addTo(this.map);
      //       });
      //     });
      //   },
      //   classes: ['draw-circle'],
      //   title: 'Draw Circle tool',
      // },
      {
        //===== Freform Polygon
        on: 'click',
        action: () => {
          try {
            draw.changeMode('freehandMode');
          } catch (err) {
            console.error(err);
          }
        },
        classes: ['free-hand'],
        title: 'Free-Hand Draw Mode tool',
      },
      {
        //===== Rectangle with max area
        on: 'click',
        action: () => {
          try {
            draw.changeMode('draw_rectangle', {
              areaLimit: parseInt(prompt('Max Area? (empty for no restriction)')), // 5 * 1_000_000, // 5 km2, optional
              // escapeKeyStopsDrawing: true, // default true
              // allowCreateExceeded: false, // default false
              // exceedCallsOnEachMove: false, // default false
              // exceedCallback: (area) => console.log('exceeded!', area), // optional
              // areaChangedCallback: (area) => console.log('updated', area), // optional
            });
          } catch (err) {
            console.error(err);
          }
        },
        classes: ['draw-rectangle'],
        title: 'Rectangle Draw Mode tool',
      },
      {
        //===== Rectangle Assisted
        on: 'click',
        action: () => {

          try {
            draw.changeMode('draw_rectangle_assisted');
          } catch (err) {
            console.error(err);
          }
        },
        classes: ['draw-rectangle-assisted'],
        title: 'Assisted Rectangle Draw Mode tool',
      },
      {
        //===== Split Line
        on: 'click',
        customize_button: (elButton) => {
          const splitLine = (mode) => {
            console.log("=== split line mode : ", mode, draw)
            try {
              draw.changeMode('splitLineMode', { spliter: mode });
            } catch (err) {
              document.getElementById("split-line-menu-container").style.display = "flex";
              alert(err.message);
              console.error(err);
            }
          };
          // construct menu
          let bottonContainer = document.createElement('div');
          bottonContainer.id = 'split-line-menu-container-wrapper';
          let menuContainer = document.createElement('div');
          menuContainer.className = 'mapboxgl-ctrl-group';
          menuContainer.classList.add('horizontal');
          menuContainer.id = 'split-line-menu-container';
          menuContainer.style.display = "none";

          var elButton1 = document.createElement('button');
          elButton1.className = 'mapbox-gl-draw_ctrl-draw-btn';
          elButton1.classList.add('mapbox-gl-draw_line');
          elButton1.addEventListener('click', ()=>{
            console.log("=== action click")
            document.getElementById("split-line-menu-container").style.display = "none";
            splitLine('line_string');
          });

          // var elButton2 = document.createElement('button');
          // elButton2.className = 'mapbox-gl-draw_ctrl-draw-btn';
          // elButton2.classList.add('mapbox-gl-draw_point');
          // elButton2.addEventListener('click', ()=>{
          //   document.getElementById("split-line-menu-container").style.display = "none";
          //   splitLine('point');
          // });

          var elButton3 = document.createElement('button');
          elButton3.className = 'mapbox-gl-draw_ctrl-draw-btn';
          elButton3.classList.add('mapbox-gl-draw_polygon');
          elButton3.addEventListener('click', ()=>{
            document.getElementById("split-line-menu-container").style.display = "none";
            splitLine('polygon');
          });
          menuContainer.appendChild(elButton1)
          // menuContainer.appendChild(elButton2)
          menuContainer.appendChild(elButton3)
          elButton.splitMenu=menuContainer
          bottonContainer.appendChild(menuContainer)
          bottonContainer.appendChild(elButton)

          return bottonContainer; //elButton;
        },
        action: () => {
          let isVisible = ("flex"==document.getElementById("split-line-menu-container").style.display);
          if (isVisible) {
            document.getElementById("split-line-menu-container").style.display = "none";
            return;
          }

          console.log("==== selected feature", this.getSelectedIds(), this.getSelected())
          let selectedIds = this.getSelectedIds(), selected = this.getSelected();
          if (selectedIds.length!=1 || !['MultiLinestring','LineString'].includes(selected.features[0]?.geometry?.type)) {
            document.getElementById("split-line-menu-container").style.display = "none"
            alert("Please select a Linestring/MultiLinestring! to precess line-split");
            return;
          }

          document.getElementById("split-line-menu-container").style.display = "flex";

          // console.log("==== click action", this, isVisible?"none":"flex")
          this.map?.fire("draw.instruction",{message:"open line split menu", action:"open-split-menu"})
          // alert("==== click action | "+document.getElementById("split-line-menu-container").style.display+" | "+isVisible?"none":"flex");



          // try {
          //   draw.changeMode('splitLineMode', {
          //     spliter: prompt('Which Mode? (point, line_string, polygon)'),
          //   });
          // } catch (err) {
          //   alert(err.message);
          //   console.error(err);
          // }
        },
        classes: ['split-line'],
        title: 'Split Line Mode tool',
      },
      {
        //===== Split Polygon
        on: 'click',
        action: () => {
          const selectedFeatureIDs = draw.getSelectedIds();
          console.log(
            '🚀 ~ file: index.js ~ line 222 ~ MapboxDrawPro ~ constructor ~ selectedFeatureIDs',
            selectedFeatureIDs
          );

          function goSplitMode(selectedFeatureIDs) {
            try {
              draw?.changeMode('split_polygon', {
                featureIds: selectedFeatureIDs,
                /** Default option vlaues: */
                highlightColor: '#222',
                // lineWidth: 0,
                // lineWidthUnit: "kilometers",
              });
            } catch (err) {
              console.error(err);
            }
          }

          if (selectedFeatureIDs.length > 0) {
            goSplitMode(selectedFeatureIDs);
          } else {
            draw.changeMode('select_feature', {
              selectHighlightColor: 'yellow',
              onSelect(selectedFeatureID) {
                goSplitMode([selectedFeatureID]);
              },
            });
          }
        },
        classes: ['split-polygon'],
        title: 'Split Polygon Mode tool',
      },
      {
        //===== Cut Polygon
        on: 'click',
        action: () => {
          try {
            draw.changeMode('cut_polygon');
          } catch (err) {
            alert(err.message);
            console.error(err);
          }
        },
        classes: ['cut-polygon'],
        title: 'Cut Polygon Mode tool',
      },
      {
        //===== Scal&Rotate
        on: 'click',
        action: () =>{
          try {
            draw.changeMode('scaleRotateMode', {
              // required
              canScale: true,
              canRotate: true, // only rotation enabled
              canTrash: false, // disable feature delete
      
              rotatePivot: SRCenter.Center, // rotate around center
              scaleCenter: SRCenter.Opposite, // scale around opposite vertex
      
              singleRotationPoint: true, // only one rotation point
              rotationPointRadius: 1.2, // offset rotation point
      
              canSelectFeatures: true,
            });
          } catch (err) {
            alert(err.message);
            console.error(err);
          }
        },
        classes: ['rotate-icon'],
        title: 'Scale and Rotate Mode tool',
      },
      {
        //===== Pinning
        on: 'click',
        action: () => {
          draw.changeMode('pinning_mode');
        },
        classes: ['pinning_mode'],
        title: 'Pinning Mode tool',
      },
      // {
      //     on: 'click',
      //     action: () => {
      //         draw.changeMode('passing_mode_point');
      //     },
      //     classes: ['passing_mode', 'point'],
      //     title: 'Passing-Point tool',
      // },
      // {
      //     on: 'click',
      //     action: () => {
      //         draw.changeMode('passing_mode_line_string', (info) => {
      //             console.log(info);
      //         });
      //     },
      //     classes: ['passing_mode', 'line'],
      //     title: 'Passing-LineString tool',
      // },
      // {
      //     on: 'click',
      //     action: () => {
      //         draw.changeMode('passing_mode_polygon');
      //     },
      //     classes: ['passing_mode', 'polygon'],
      //     title: 'Passing-Polygon tool',
      // },
      {
        //===== combine
        on: "click",
        action: () => {
          draw.combineFeatures();
        },
        classes: ["mapbox-gl-draw_combine"],
        title: "Combine",
      },
      {
        //===== Trash
        on: "click",
        action: () => {
          draw.uncombineFeatures();
        },
        classes: ["mapbox-gl-draw_uncombine"],
        title: "Uncombine",
      },
      {
        //===== Trash
        on: "click",
        action: () => {
          draw.trash();
        },
        classes: ["mapbox-gl-draw_trash"],
        title: "Delete",
      }
    ];

    this.onAddOrig = this.onAdd;
    this.onRemoveOrig = this.onRemove;


    this.onAdd = (map, placement) => {
      this.map = map;
      this.elContainer = this.onAddOrig(map, placement);

      this.buttons.forEach((b) => {
        this.addButton(b);
      });

      // addOtherControls(map, this, placement);
      addExtraHandling(map)
      return this.elContainer;
    };

    this.onRemove = (map) => {
      this.buttons.forEach((b) => {
        this.removeButton(b);
      });
      this.onRemoveOrig(map);
    };

    this.addButton = (opt) => {
      var elButton = document.createElement('button');
      elButton.className = 'mapbox-gl-draw_ctrl-draw-btn';
      elButton.setAttribute('title', opt.title);
      if (opt.classes instanceof Array) {
        opt.classes.forEach((c) => {
          elButton.classList.add(c);
        });
      }
      elButton.addEventListener(opt.on, opt.action);
      let elButton_ = opt.customize_button?opt.customize_button(elButton):elButton;
      this.elContainer.appendChild(elButton_);
      opt.elButton = elButton;
    };

    this.removeButton = (opt) => {
      opt.elButton.removeEventListener(opt.on, opt.action);
      opt.elButton.remove();
    };

  }
}

const addExtraHandling = (map) => {
  map.on('draw.instruction', function (e) {
    console.log("----- on draw.instruction > action | msg : ", e.action, e.message);

    // if (e.action=="open-split-menu") {
    //   let isVisible = ("flex"==document.getElementById("split-line-menu-container").style.display);
    //       document.getElementById("split-line-menu-container").style.display = (isVisible?"none":"flex");
    // } else {
    //   console.log(">>> no action")
    // }


  });
}

const addOtherControls = async (map, draw, placement) => {
  const snapOptionsBar = new SnapOptionsToolbar({
    draw,
    checkboxes: [
      {
        on: 'change',
        action: (e) => {
          draw.options.snap = e.target.checked;
        },
        classes: ['snap_mode', 'snap'],
        title: 'Snap when Draw',
        initialState: 'checked',
      },
      {
        on: 'change',
        action: (e) => {
          draw.options.guides = e.target.checked;
        },
        classes: ['snap_mode', 'grid'],
        title: 'Show Guides',
      },
    ],
  });
  setTimeout(() => {
    map.addControl(additionalTools(draw), placement);
    map.addControl(snapOptionsBar, placement);
  }, 400);
};