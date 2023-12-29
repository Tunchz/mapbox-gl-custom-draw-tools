import MapboxDraw from '@mapbox/mapbox-gl-draw';
import defaultDrawStyle from '@mapbox/mapbox-gl-draw/src/lib/theme';
import * as Constants from '@mapbox/mapbox-gl-draw/src/constants';
import unionBy from 'lodash.unionby';
// import SelectFeatureMode, { drawStyles as selectFeatureDrawStyles } from 'mapbox-gl-draw-select-mode';
import SelectFeatureMode, { drawStyles as selectFeatureDrawStyles } from './lib/mapbox-gl-draw-select-mode';
import { SnapPolygonMode, SnapPointMode, SnapLineMode, SnapModeDrawStyles } from './lib/mapbox-gl-draw-snap-mode';
import mapboxGlDrawPinningMode from './lib/mapbox-gl-draw-pinning-mode';
import * as mapboxGlDrawPassingMode from './lib/mapbox-gl-draw-passing-mode';
// import mapboxGlDrawPassingMode from 'mapbox-gl-draw-passing-mode';
// import { SRMode, SRCenter, SRStyle } from 'mapbox-gl-draw-scale-rotate-mode';
import { SRMode, SRCenter, SRStyle } from './lib/mapbox-gl-draw-scale-rotate-mode';
// import SplitPolygonMode, { drawStyles as splitPolygonDrawStyles } from 'mapbox-gl-draw-split-polygon-mode';
// import CutPolygonMode, { drawStyles as cutPolygonDrawStyles } from 'mapbox-gl-draw-cut-polygon-mode';
import SplitPolygonMode, { drawStyles as splitPolygonDrawStyles } from './lib/mapbox-gl-draw-split-polygon-mode';
import CutPolygonMode, { drawStyles as cutPolygonDrawStyles } from './lib/mapbox-gl-draw-cut-polygon-mode';
// import SplitLineMode from 'mapbox-gl-draw-split-line-mode';
// import SplitLineMode from './lib/mapbox-gl-draw-split-line-mode';
import SplitLineMode, {drawStyles as splitLineDrawStyles } from './lib/mapbox-gl-draw-split-line-mode';
import FreehandMode from './lib/mapbox-gl-draw-freehand-mode';
import DrawRectangle, { DrawStyles as RectRestrictStyles } from './lib/mapbox-gl-draw-rectangle-restrict-area';
import DrawRectangleAssisted from './lib/mapbox-gl-draw-rectangle-assisted-mode';
import { additionalTools, measurement, addToolStyle } from './lib/mapbox-gl-draw-additional-tools';
import DrawEllipse from './lib/mapbox-gl-draw-ellipse';
import {
  SimpleSelectModeBezierOverride, 
  DirectModeBezierOverride, 
  DrawBezierCurve, 
  customStyles as bezierStyles,
} from './lib/mapbox-gl-draw-bezier-curve-mode';
import DragCircleMode from './lib/mapbox-gl-draw-drag-circle-mode'
import DragEllipseMode from './lib/mapbox-gl-draw-drag-ellipse-mode'

import PaintMode, { drawStyles as paintDrawStyles } from './lib/mapbox-gl-draw-paint-mode';

// import MapboxCircle from 'mapbox-gl-circle';
const MapboxCircle = require('mapbox-gl-circle');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');
require('./custom-draw-tools.css');

// import SimpleSelectMode from '@mapbox/mapbox-gl-draw/src/modes/simple_select';

class SnapOptionsToolbar {
  constructor(opt) {
    let ctrl = this;
    ctrl.checkboxes = opt.checkboxes || [];
    ctrl.onRemoveOrig = opt.draw.onRemove;
    ctrl.horizontal = opt.draw.options?.horizontal;
    ctrl.draw = opt.draw
  }
  onAdd(map) {
    let ctrl = this;
    ctrl.map = map;
    ctrl._container = document.createElement('div');
    ctrl._container.className = `mapboxgl-ctrl-group mapboxgl-ctrl custom-tools-group${ctrl.horizontal?" horizontal":""} ${ctrl.edge}`;
    ctrl.elContainer = ctrl._container;
    ctrl.draw.groups_item&&ctrl.draw.groups_item.push(ctrl.elContainer)
    ctrl.checkboxes.forEach((b) => {
      ctrl.addCheckbox(b);
    });
    ctrl.buttonElements={}
    ctrl.activeButton=null
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

    // console.log("--- features_select modes : ", CutPolygonMode(SplitPolygonMode(SelectFeatureMode(MapboxDraw.modes))))

    const customModes = {
      // ...MapboxDraw.modes,
      ...PaintMode(CutPolygonMode(SplitPolygonMode(SplitLineMode(SelectFeatureMode(MapboxDraw.modes))))),
      draw_point: SnapPointMode,
      draw_polygon: SnapPolygonMode,
      draw_line_string: SnapLineMode,
      pinning_mode: mapboxGlDrawPinningMode,
      passing_mode_point: mapboxGlDrawPassingMode.passing_draw_point,
      passing_mode_line_string: mapboxGlDrawPassingMode.passing_draw_line_string,
      passing_mode_polygon: mapboxGlDrawPassingMode.passing_draw_polygon,
      scaleRotateMode: SRMode,
      freehandMode: FreehandMode,
      draw_rectangle: DrawRectangle,
      draw_rectangle_assisted: DrawRectangleAssisted,
      // simple_select: SimpleSelectMode,
      draw_ellipse : DrawEllipse,
      simple_select: SimpleSelectModeBezierOverride,
      direct_select: DirectModeBezierOverride,
      draw_bezier_curve: DrawBezierCurve,
      drag_circle: DragCircleMode,
      drag_ellipse: DragEllipseMode,
    };

    const customOptions = {
      bufferSize: 0.5,
      bufferUnit: 'kilometers',
      bufferSteps: 64,
      snap: true,
      snapOptions: {
        snapPx: 15,
        snapToMidPoints: true,
      },
      guides: false,
      userProperties: true,
      ...other,
      displayControlsDefault: false,
    };

    const _controls = {...controls, line_string:false, polygon:false, point:false, combine:false, uncombine:false, trash:false}

    const _modes = { ...customModes, ...modes };
    const __styles = [...paintDrawStyles(cutPolygonDrawStyles(splitPolygonDrawStyles(splitLineDrawStyles(selectFeatureDrawStyles(defaultDrawStyle)))))];
    const _styles = unionBy(__styles, styles, RectRestrictStyles, SnapModeDrawStyles, SRStyle, addToolStyle, bezierStyles, 'id');
    const _options = { modes: _modes, styles: _styles, controls:_controls, ...customOptions, ...otherOtions };
    // console.log("--- options : ", options, _options.edge, otherOtions)
    super(_options);


    this.buttons = [
      {
        //===== line
        on: "click",
        action: () => {
          this.changeMode('draw_line_string');
        },
        classes: ["mapbox-gl-draw_line"],
        id: "draw-line-tool",
        title: "Line",
      },
      {
        //===== polygon
        on: "click",
        action: () => {
          this.changeMode('draw_polygon');
        },
        classes: ["mapbox-gl-draw_polygon"],
        id: "draw-polygon-tool",
        title: "Polygon",
      },
      {
        //===== point
        on: "click",
        action: () => {
          this.changeMode('draw_point');
        },
        classes: ["mapbox-gl-draw_point"],
        id: "draw-point-tool",
        title: "Point",
      },
      {
        on: "click", 
        action: () => {
          this.changeMode("draw_bezier_curve")
        }, 
        classes: ["bezier-curve-icon"], 
        title:'Bezier tool'
      },
      {
        //===== drag circle
        on: "click",
        action: () => {
          this.changeMode('drag_circle');
        },
        classes: ["draw-circle"],
        id: "Drag-Circle",
        title: "Cicle",
      },
      {
        //===== ellipse
        on: "click",
        action: () => {
          this.changeMode('drag_ellipse', { eccentricity: 0.8, divisions: 60 });
        },
        classes: ["draw-ellipse"],
        id: "Ellipse",
        title: "Ellipse",
      },
    
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
        //===== Rectangle with max area
        on: 'click',
        customize_button: (elButton) => {
          const drawRec = (limit) => {
            console.log("=== draw rec limit : ", limit)
            try {
              this.changeMode('draw_rectangle', {
                areaLimit: parseInt(limit), //limit, 
              });
            } catch (err) {
              console.error(err);
            }
          };
          // construct menu
          let bottonContainer = document.createElement('div');
          bottonContainer.className = 'button-submenu-container-wrapper';
          let menuContainer = document.createElement('div');
          menuContainer.className = 'mapboxgl-ctrl-group';
          menuContainer.classList.add('horizontal');
          menuContainer.classList.add(this.options?.edge);
          menuContainer.classList.add('button-submenu-container');
          menuContainer.id = 'rectangle-submenu';
          menuContainer.style.display = "none";

          var input = document.createElement('input');
          input.className = 'mapbox-gl-draw-rectangle-input';
          input.id = 'rectangle-input-limit'
 
          var elButton1 = document.createElement('button');
          elButton1.className = 'mapbox-gl-draw_ctrl-draw-btn';
          elButton1.classList.add('draw-rectangle');
          elButton1.addEventListener('click', ()=>{
            let recLimitEl = document.getElementById('rectangle-input-limit')
            console.log("=== rec limit input : ")
            drawRec(recLimitEl.value)
          });

          menuContainer.appendChild(input)
          menuContainer.appendChild(elButton1)
          elButton.subMenu=menuContainer
          bottonContainer.appendChild(menuContainer)
          bottonContainer.appendChild(elButton)
          // elButton.appendChild(bottonContainer)
          return bottonContainer; //elButton;
        },
        action: () => {
          document.getElementById("rectangle-submenu").style.display = "flex";
          this.map?.fire("draw.instruction",{message:"open rectangle submenu", action:"open-rectangle-submenu"})
          try {
            this.changeMode('draw_rectangle', {
              areaLimit: null, 
            });
          } catch (err) {
            console.error(err);
          }

          // try {
          //   this.changeMode('draw_rectangle', {
          //     areaLimit: parseInt(prompt('Max Area? (empty for no restriction)')), // 5 * 1_000_000, // 5 km2, optional
          //     // escapeKeyStopsDrawing: true, // default true
          //     // allowCreateExceeded: false, // default false
          //     // exceedCallsOnEachMove: false, // default false
          //     // exceedCallback: (area) => console.log('exceeded!', area), // optional
          //     // areaChangedCallback: (area) => console.log('updated', area), // optional
          //   });
          // } catch (err) {
          //   console.error(err);
          // }
        },
        cancel: () => {
          document.getElementById("rectangle-submenu").style.display = "none";
          this.map?.fire("draw.instruction",{message:"close rectangle submenu", action:"close-rectangle-submenu"})
        },
        classes: ['draw-rectangle'],
        title: 'Rectangle Draw Mode tool',
      },
      {
        //===== Rectangle Assisted
        on: 'click',
        action: () => {

          try {
            this.changeMode('draw_rectangle_assisted');
          } catch (err) {
            console.error(err);
          }
        },
        classes: ['draw-rectangle-assisted'],
        title: 'Assisted Rectangle Draw Mode tool',
      },
      {
        //===== Paint 
        on: "click",
        action: () => {
          try {
            this.changeMode("draw_paint_mode");
          } catch (err) {
            console.error(err);
          }
        },
        classes: ["draw-paint"],
        title: "Paint (Free Drawing)",
        cancel: ()=>{this.trash();}
      },
      {
        //===== Freform Polygon
        on: 'click',
        action: () => {
          try {
            this.changeMode('freehandMode');
          } catch (err) {
            console.error(err);
          }
        },
        classes: ['free-hand'],
        title: 'Free-Hand Draw Mode tool',
      },
      // {
      //   //===== Split Line
      //   on: 'click',
      //   customize_button: (elButton) => {
      //     const splitLine = (mode) => {
      //       console.log("=== split line mode : ", mode, draw)
      //       try {
      //         this.changeMode('splitLineMode', { spliter: mode });
      //       } catch (err) {
      //         document.getElementById("split-line-menu-container").style.display = "flex";
      //         alert(err.message);
      //         console.error(err);
      //       }
      //     };
      //     // construct menu
      //     let bottonContainer = document.createElement('div');
      //     bottonContainer.id = 'split-line-menu-container-wrapper';
      //     let menuContainer = document.createElement('div');
      //     menuContainer.className = 'mapboxgl-ctrl-group';
      //     menuContainer.classList.add('horizontal');
      //     menuContainer.id = 'split-line-menu-container';
      //     menuContainer.style.display = "none";

      //     var elButton1 = document.createElement('button');
      //     elButton1.className = 'mapbox-gl-draw_ctrl-draw-btn';
      //     elButton1.classList.add('mapbox-gl-draw_line');
      //     elButton1.addEventListener('click', ()=>{
      //       console.log("=== action click")
      //       document.getElementById("split-line-menu-container").style.display = "none";
      //       splitLine('line_string');
      //     });

      //     // var elButton2 = document.createElement('button');
      //     // elButton2.className = 'mapbox-gl-draw_ctrl-draw-btn';
      //     // elButton2.classList.add('mapbox-gl-draw_point');
      //     // elButton2.addEventListener('click', ()=>{
      //     //   document.getElementById("split-line-menu-container").style.display = "none";
      //     //   splitLine('point');
      //     // });

      //     var elButton3 = document.createElement('button');
      //     elButton3.className = 'mapbox-gl-draw_ctrl-draw-btn';
      //     elButton3.classList.add('mapbox-gl-draw_polygon');
      //     elButton3.addEventListener('click', ()=>{
      //       document.getElementById("split-line-menu-container").style.display = "none";
      //       splitLine('polygon');
      //     });
      //     menuContainer.appendChild(elButton1)
      //     // menuContainer.appendChild(elButton2)
      //     menuContainer.appendChild(elButton3)
      //     elButton.splitMenu=menuContainer
      //     bottonContainer.appendChild(menuContainer)
      //     bottonContainer.appendChild(elButton)

      //     return bottonContainer; //elButton;
      //   },
      //   action: () => {
      //     let isVisible = ("flex"==document.getElementById("split-line-menu-container").style.display);
      //     if (isVisible) {
      //       document.getElementById("split-line-menu-container").style.display = "none";
      //       return;
      //     }

      //     // console.log("==== selected feature", this.getSelectedIds(), this.getSelected())
      //     let selectedIds = this.getSelectedIds(), selected = this.getSelected();
      //     if (selectedIds.length!=1 || !['MultiLinestring','LineString'].includes(selected.features[0]?.geometry?.type)) {
      //       document.getElementById("split-line-menu-container").style.display = "none"
      //       // alert("Please select a Linestring/MultiLinestring! to precess line-split");
      //       // return;
            
      //     }

      //     document.getElementById("split-line-menu-container").style.display = "flex";

      //     // console.log("==== click action", this, isVisible?"none":"flex")
      //     this.map?.fire("draw.instruction",{message:"open line split menu", action:"open-split-menu"})
      //     // alert("==== click action | "+document.getElementById("split-line-menu-container").style.display+" | "+isVisible?"none":"flex");



      //     // try {
      //     //   this.changeMode('splitLineMode', {
      //     //     spliter: prompt('Which Mode? (point, line_string, polygon)'),
      //     //   });
      //     // } catch (err) {
      //     //   alert(err.message);
      //     //   console.error(err);
      //     // }
      //   },
      //   classes: ['split-line'],
      //   title: 'Split Line Mode tool',
      // },
      {
        //===== Split Lind with Line
        on: 'click',
        action: () => {
          const selectedFeatureIDs = this.getSelectedIds();

          function goSplitMode(selectedFeatures) {
            try {
              this.changeMode('split_line', {
                spliter: 'line_string',
                features: selectedFeatures,
                /** Default option vlaues: */
                highlightColor: '#222',
              });
            } catch (err) {
              alert(err.message);
              console.error(err);
            }
          }

          if (selectedFeatureIDs.length > 0) {
            let selectedFeatures = this.getSelected()
            // console.log("---- selectedFeatures : ", selectedFeatures)
            goSplitMode(selectedFeatures.features || null);
          } else {
            // console.log("--- change mode : select_feature")
            this.changeMode('select_feature', {
              selectHighlightColor: 'yellow',
              onSelect(state) {
                goSplitMode([{
                  id: state.selectedFeatureID,
                  type:"Feature",
                  geometry:state.selectedFeature?._geometry,
                  properties:{}
                }]);
              },
              types2Select:["LineString", "MultiLineString"]
            });
          }
        },
        classes: ['split-line'],
        title: 'Split Line Mode tool (by line)',
      },
      {
        //===== Split Lind with Polygon
        on: 'click',
        action: () => {
          const selectedFeatureIDs = this.getSelectedIds();

          function goSplitMode(selectedFeatures) {
            try {
              this.changeMode('split_line', {
                spliter: 'polygon',
                features: selectedFeatures,
                /** Default option vlaues: */
                highlightColor: '#222',
              });
            } catch (err) {
              alert(err.message);
              console.error(err);
            }
          }

          if (selectedFeatureIDs.length > 0) {
            let selectedFeatures = this.getSelected()
            // console.log("---- selectedFeatures : ", selectedFeatures)
            goSplitMode(selectedFeatures.features || null);
          } else {
            // console.log("--- change mode : select_feature")
            this.changeMode('select_feature', {
              selectHighlightColor: 'yellow',
              onSelect(state) {
                goSplitMode([{
                  id: state.selectedFeatureID,
                  type:"Feature",
                  geometry:state.selectedFeature?._geometry,
                  properties:{}
                }]);
              },
              types2Select:["LineString", "MultiLineString"]
            });
          }
        },
        classes: ['split-line-polygon'],
        title: 'Split Line Mode tool (by polygon)',
      },
      {
        //===== Split Polygon
        on: 'click',
        action: () => {
          const selectedFeatureIDs = this.getSelectedIds();
          // console.log(
          //   '🚀 ~ file: index.js ~ line 222 ~ MapboxDrawPro ~ constructor ~ selectedFeatureIDs',
          //   selectedFeatureIDs
          // );

          function goSplitMode(selectedFeatures) {
            try {
              this.changeMode('split_polygon', {
                // featureIds: selectedFeatureIDs,
                features: selectedFeatures,
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
            let selectedFeatures = this.getSelected()
            goSplitMode(selectedFeatures.features || null);
          } else {
            // console.log("--- change mode : select_feature")
            this.changeMode('select_feature', {
              selectHighlightColor: 'yellow',
              onSelect(state) {
                goSplitMode([{
                  id: state.selectedFeatureID,
                  type:"Feature",
                  geometry:state.selectedFeature?._geometry,
                  properties:{}
                }]);
              },
              types2Select:["Polygon", "MultiPolygon"]
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
          // try {
          //   this.changeMode('cut_polygon');
          // } catch (err) {
          //   alert(err.message);
          //   console.error(err);
          // }

          const selectedFeatureIDs = this.getSelectedIds();
          // console.log("----- selectedFeatureIDs : ", selectedFeatureIDs)

          function goCutPolygonMode(selectedFeatures) {
            try {
              // this.changeMode('cut_polygon');
              this.changeMode('cut_polygon', {
                features: selectedFeatures,
                highlightColor: '#222',
              });
            } catch (err) {
              alert(err.message);
              console.error(err);
            }
            
          }

          if (selectedFeatureIDs?.length > 0) {
            let selectedFeatures = this.getSelected()
            goCutPolygonMode(selectedFeatures.features || null);
          } else {
            // console.log("--- change mode : select_feature")
            this.changeMode('select_feature', {
              selectHighlightColor: 'yellow',
              onSelect(state) {
                console.log("--- state : ", state)
                goCutPolygonMode([{
                  id: state.selectedFeatureID,
                  type:"Feature",
                  geometry:state.selectedFeature?._geometry,
                  properties:{}
                }]);
                // goCutPolygonMode(null)
              },
              types2Select:["Polygon","MultiPolygon"]
            });
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
            this.changeMode('scaleRotateMode', {
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
          this.changeMode('pinning_mode');
        },
        classes: ['pinning_mode'],
        title: 'Pinning Mode tool',
      },
      // {
      //     on: 'click',
      //     action: () => {
      //         this.changeMode('passing_mode_point');
      //     },
      //     classes: ['passing_mode', 'point'],
      //     title: 'Passing-Point tool',
      // },
      // {
      //     on: 'click',
      //     action: () => {
      //         this.changeMode('passing_mode_line_string', (info) => {
      //             console.log(info);
      //         });
      //     },
      //     classes: ['passing_mode', 'line'],
      //     title: 'Passing-LineString tool',
      // },
      // {
      //     on: 'click',
      //     action: () => {
      //         this.changeMode('passing_mode_polygon');
      //     },
      //     classes: ['passing_mode', 'polygon'],
      //     title: 'Passing-Polygon tool',
      // },
      {
        //===== combine
        on: "click",
        action: () => {
          this.combineFeatures();
        },
        classes: ["mapbox-gl-draw_combine"],
        title: "Combine",
      },
      {
        //===== Trash
        on: "click",
        action: () => {
          this.uncombineFeatures();
        },
        classes: ["mapbox-gl-draw_uncombine"],
        title: "Uncombine",
      },
      {
        //===== Trash
        on: "click",
        action: () => {
          this.trash();
        },
        classes: ["mapbox-gl-draw_trash"],
        title: "Trash",
      }
    ];

    this.onAddOrig = this.onAdd;
    this.onRemoveOrig = this.onRemove;


    this.onAdd = (map, placement) => {
      this.map = map;
      // console.log("==== this | draw : ", this, draw)
      // console.log("==== placement : ", placement)
      placement = placement || 'top-right'
      this.elContainer = this.onAddOrig(map, placement);
      
      // this.options.edge = placement?.split('-')[this.options.horizontal?0:1]
      // !!this.options.edge&&(this.options.edge = this.options.horizontal?'top':'right')
      // console.log(" draw | placement : ", draw, placement);

      console.log("==== edge : ", this.options.edge)
      // console.log("==== this.elContainer : ", this.elContainer)
      this.elContainer.classList.add(this.options.horizontal?"horizontal":"")
      this.elContainer.classList.add(this.options.edge)
      this.elContainer.classList.add('custom-tools-group')

      this.buttons.forEach((b) => {
        this.addButton(b);
      });

      addOtherControls(map, this, placement);
      addExtraHandling(map, this)

      this.group_elContainer = document.createElement('div')
      this.group_elContainer.id = 'custom-tools-container'
      this.group_elContainer.className = 'custom-tools-container'
      this.group_elContainer.appendChild(this.elContainer)

      this.groups_item = []
      this.groups_item.push(this.elContainer)

      return this.group_elContainer; //this.elContainer;
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
      if (opt.id) {
        elButton.id = opt.id;
      }
      elButton.cancel = opt.cancel
      elButton.addEventListener(opt.on, (e)=>{
        e.preventDefault();
        e.stopPropagation();
        const clickedButton = e.target;
        if (clickedButton === this.activeButton) {
          // elButton?.classList?.remove("active")
          this.deactivateButtons();
          return;
        }
        // elButton?.classList?.add("active")
        this.setActiveButton(opt.title)
        opt.action(e)
      }, true);
      let elButton_ = opt.customize_button?opt.customize_button(elButton):elButton;
      this.elContainer.appendChild(elButton_);
      opt.elButton = elButton;
      if (!this.buttonElements) {
        this.buttonElements = {[opt.title]:opt.elButton}
      } else {
        this.buttonElements[opt.title]=opt.elButton
      }
    };


    this.deactivateButtons = () => {
      if (!this.activeButton) return;
      this.activeButton.classList.remove(Constants.classes.ACTIVE_BUTTON);
      this.activeButton.cancel&&this.activeButton.cancel()
      this.activeButton = null;
    }

    this.activateUIButton = (id) => {console.log("--- activateUIButton : ", id)}
  
    this.setActiveButton = (id) => {
      this.curActiveButton = id
      this.deactivateButtons();
  
      const button = this.buttonElements[id];
      if (!button) return;
  
      if (button && !['Trash', 'Combine', 'Uncombine'].includes(id)) {
        button.classList.add(Constants.classes.ACTIVE_BUTTON);
        this.activeButton = button;
      }
    }


    this.removeButton = (opt) => {
      opt.elButton.removeEventListener(opt.on, opt.action);
      opt.elButton.remove();
    };

  }
}

const addExtraHandling = (map, draw) => {
  // console.log("==== this : ", draw)

  // map.on('mousemove', function (e) {
  //   // console.log("=== this.getMode() : ", this.getMode())
  //   if (this.getMode() === "draw_rectangle_assisted") {
       
  //       const features = map.queryRenderedFeatures(e.point);

  //       // console.log("=== features : ", features)
  //       if (features[0] && features[0].layer && features[0].layer.id === "gl-draw-line-active.hot") {
  //           console.log("--- instruction : ", "Angle:" + features[0].properties.angle)
  //           document.getElementById("mapbox-gl-custom-draw-tool-instruction").innerHTML = "Angle:" + features[0].properties.angle;
  //       }
  //   }
  // });


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

    setTimeout(()=>draw.groups_item?.map((el)=>{draw.group_elContainer.appendChild(el)}),10);
  }, 400);
};