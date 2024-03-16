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
import PaintMode, { drawStyles as paintDrawStyles } from './lib/mapbox-gl-draw-paint-mode';
import FreehandMode from './lib/mapbox-gl-draw-freehand-mode';
import DrawRectangle, { DrawStyles as RectRestrictStyles } from './lib/mapbox-gl-draw-rectangle-restrict-area';
import DrawRectangleAssisted from './lib/mapbox-gl-draw-rectangle-assisted-mode';
import { additionalTools, measurement, addToolStyle } from './lib/mapbox-gl-draw-additional-tools';
import DrawEllipse from './lib/mapbox-gl-draw-ellipse';
// import {
//   SimpleSelectModeBezierOverride, 
//   DirectModeBezierOverride, 
//   DrawBezierCurve, 
//   customStyles as bezierStyles,
// } from './lib/mapbox-gl-draw-bezier-curve-mode';
import DragCircleMode from './lib/mapbox-gl-draw-drag-circle-mode'
import DragEllipseMode from './lib/mapbox-gl-draw-drag-ellipse-mode'
import StaticMode from './lib/mapbox-gl-draw-static-mode';


// import MapboxCircle from 'mapbox-gl-circle';
const MapboxCircle = require('mapbox-gl-circle');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');
require('./custom-draw-tools.css');

import SimpleSelectMode from '@mapbox/mapbox-gl-draw/src/modes/simple_select';

class OptionsToolbar {
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
    ctrl._container.className = `mapboxgl-ctrl-group mapboxgl-ctrl custom-tools-group${ctrl.horizontal?" horizontal":"vertical"} ${ctrl.edge}`;
    ctrl.elContainer = ctrl._container;
    ctrl.draw.groups_item&&ctrl.draw.groups_item.push(ctrl.elContainer)
    ctrl.checkboxes.forEach((b) => {
      !b.disabled&&ctrl.addCheckbox(b);
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
    // console.log("----- opt : ", opt)
    var elCheckbox = opt.initialState?document.createElement('input'):document.createElement('button');
    opt.initialState&&elCheckbox.setAttribute('type', 'checkbox');
    elCheckbox.setAttribute('title', opt.title);
    opt.initialState&&(elCheckbox.checked = opt.initialState === 'checked');
    elCheckbox.id = opt.id;
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
    const { modes, styles, controls, otherOptions, ...other } = options;


    // const [isTypeMenuActive, setIsTypeMenuActive] = useState(false);
    // const openMenu = () => {
    //   setIsTypeMenuActive(true);
    // };

    // console.log("--- features_select modes : ", CutPolygonMode(SplitPolygonMode(SelectFeatureMode(MapboxDraw.modes))))

    const customModes = {
      // ...MapboxDraw.modes,
      ...PaintMode(CutPolygonMode(SplitPolygonMode(SplitLineMode(SelectFeatureMode(MapboxDraw.modes)))),{...otherOptions?.paint||{}}),
      static: StaticMode,
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
      draw_ellipse : DrawEllipse,
      simple_select: SimpleSelectMode,
      // simple_select: SimpleSelectModeBezierOverride,
      // direct_select: DirectModeBezierOverride,
      // draw_bezier_curve: DrawBezierCurve,
      drag_circle: DragCircleMode,
      drag_ellipse: DragEllipseMode,
    };

    const customOptions = {
      bufferSize: 0.5,
      bufferUnit: 'kilometers',
      bufferSteps: 64,
      snap: false,
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
    const __styles = [...cutPolygonDrawStyles(splitPolygonDrawStyles(splitLineDrawStyles(selectFeatureDrawStyles(paintDrawStyles(defaultDrawStyle)))))];
    const _styles = unionBy(__styles, styles, RectRestrictStyles, SnapModeDrawStyles, SRStyle, addToolStyle/*, bezierStyles*/, 'id');
    const _options = { modes: _modes, styles: _styles, controls:_controls, ...customOptions, ...otherOptions };
    console.log("--- options : ", _options)
    super(_options);


    this.buttons = [
      {
        //===== point
        on: "click",
        action: () => {
          this.changeMode('static');
          // this.map?.fire("draw.instruction",{
          //   action:"วาดจุด",
          //   message:"คลิกเพื่อกำหนดจุด", 
          // })
        },
        classes: ["static-mode"],
        id: "static-mode",
        title: "static",
        disabled: controls.static==false,
      },
      {
        //===== point
        on: "click",
        action: () => {
          this.changeMode('draw_point');
          this.map?.fire("draw.instruction",{
            action:"วาดจุด",
            message:"คลิกเพื่อกำหนดจุด", 
          })
        },
        classes: ["mapbox-gl-draw_point"],
        id: "draw-point-tool",
        title: "Point",
        disabled: controls.point==false,
      },
      {
        //===== line
        on: "click",
        action: () => {
          this.changeMode('draw_line_string');
          this.map?.fire("draw.instruction",{
            action:"วาดเส้น",
            message:"คลิกเพื่อเริ่ม คลิกสองครั้งเมื่อเสร็จสิ้น", 
          })
        },
        classes: ["mapbox-gl-draw_line"],
        id: "draw-line-tool",
        title: "Line",
        disabled: controls.line==false,
      },
      {
        //===== polygon
        on: "click",
        action: () => {
          this.changeMode('draw_polygon');
          this.map?.fire("draw.instruction",{
            action:"วาดรูปหลายเหลี่ยม",
            message:"คลิกเพื่อเริ่ม คลิกสองครั้งเมื่อเสร็จสิ้น", 
          })
        },
        classes: ["mapbox-gl-draw_polygon"],
        id: "draw-polygon-tool",
        title: "Polygon",
        disabled: controls.polygon==false,
      },
      {
        //===== drag circle
        on: "click",
        action: () => {
          this.changeMode('drag_circle');
          this.map?.fire("draw.instruction",{
            action:"วาดวงกลม",
            message:"คลิกเพื่อกำหนดจุดศูนย์กลาง คลิกอีกครั้งเพื่อกำหนดรัศมี", 
          })
        },
        classes: ["draw-circle"],
        id: "Drag-Circle",
        title: "Circle",
        disabled: controls.circle==false,
      },
      {
        //===== ellipse
        on: "click",
        action: () => {
          this.changeMode('drag_ellipse', { eccentricity: 0.8, divisions: 60 });
          this.map?.fire("draw.instruction",{
            action:"วาดวงรี",
            message:"คลิกเพื่อกำหนดจุดศูนย์กลาง คลิกอีกครั้งเพื่อกำหนดรัศมี", 
          })
        },
        classes: ["draw-ellipse"],
        id: "Ellipse",
        title: "Ellipse",
        disabled: controls.ellipse==false,
      },
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
            this.map?.fire("draw.instruction",{
              action:"วาดสี่เหลี่ยม",
              message:"คลิกเพื่อกำหนดจุดแรก คลิกอีกครั้งเพื่อกำหนดสิ้นสุด", 
            })
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
        disabled: controls.rectangle==false,
      },
      {
        //===== Rectangle Assisted
        on: 'click',
        action: () => {

          try {
            this.changeMode('draw_rectangle_assisted');
            this.map?.fire("draw.instruction",{
              action:"วาดสี่เหลี่ยมในแนวมุม",
              message:"คลิกเพื่อกำหนดจุดแรก คลิกครั้งที่สองเพื่อกำหนดมุมของด้านแรก คลิกอีกครั้งเมื่อสิ้นสุด", 
            })
          } catch (err) {
            console.error(err);
          }
        },
        classes: ['draw-rectangle-assisted'],
        title: 'Assisted Rectangle Draw Mode tool',
        disabled: controls.assisted_rectangle==false,
      },
      {
        //===== Paint 
        on: "click",
        action: () => {
          try {
            this.changeMode("draw_paint_mode",{...otherOptions?.paint||{}});
            this.map?.fire("draw.instruction",{
              action:"วาดเส้นแบบอิสระ",
              message:otherOptions?.paint?.mode==2?"คลิกเพื่อเริ่ม ลากเพื่อวาด และคลิกสองครั้งเพื่อสิ้นสุด":"คลิกค้างเพื่อลากเส้น", 
            })
          } catch (err) {
            console.error(err);
          }
        },
        classes: ["draw-paint"],
        title: "Paint (Free Drawing)",
        cancel: ()=>{
          console.log("--- cancel");
          // this.changeMode('simple_select');
          // this.trash();
        },
        disabled: controls.paint==false,
      },
      {
        //===== Freform Polygon
        on: 'click',
        action: () => {
          try {
            this.changeMode('freehandMode');
            this.map?.fire("draw.instruction",{
              action:"วาดรูปหลายเหลี่ยมแบบอิสระ",
              message:"คลิกเพื่อเริ่ม ลากเพื่อวาด และคลิกสองครั้งเพื่อสิ้นสุด", 
            })
          } catch (err) {
            console.error(err);
          }
        },
        classes: ['free-hand'],
        title: 'Free-Hand Draw Mode tool',
        disabled: controls.freehand==false,
      },
      {
        //===== Split Lind with Line
        on: 'click',
        action: () => {
          const selectedFeatureIDs = this.getSelectedIds();

          function goSplitMode(draw,selectedFeatures) {
            try {
              draw?.changeMode('split_line', {
                spliter: 'line_string',
                features: selectedFeatures,
                /** Default option vlaues: */
                highlightColor: '#222',
              });
              this.map?.fire("draw.instruction",{
                action:"ตัดแยกเส้นด้วยเส้น",
                message:"คลิกเพื่อกำหนดจุดเริ่มเส้นตัด คลิกอีกครั้งเพื่อสิ้นสุด", 
              })
            } catch (err) {
              alert(err.message);
              console.error(err);
            }
          }

          if (selectedFeatureIDs.length > 0) {
            let selectedFeatures = this.getSelected()
            // console.log("---- selectedFeatures : ", selectedFeatures)
            goSplitMode(this,selectedFeatures.features || null);
          } else {
            // console.log("--- change mode : select_feature")
            this.changeMode('select_feature', {
              selectHighlightColor: 'yellow',
              onSelect(state) {
                goSplitMode(state.draw,[{
                  id: state.selectedFeatureID,
                  type:"Feature",
                  geometry:state.selectedFeature?._geometry,
                  properties:{}
                }]);
              },
              types2Select:["LineString", "MultiLineString"]
            });
            this.map?.fire("draw.instruction",{
              action:"ตัดแยกเส้นด้วยเส้น",
              message:"เลือกเส้นที่ต้องการตัด", 
            })
          }
        },
        classes: ['split-line'],
        title: 'Split Line Mode tool (by line)',
        disabled: controls.split_line_line==false,
      },
      {
        //===== Split Lind with Polygon
        on: 'click',
        action: () => {
          const selectedFeatureIDs = this.getSelectedIds();

          function goSplitMode(draw, selectedFeatures) {
            try {
              draw?.changeMode('split_line', {
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
            goSplitMode(this,selectedFeatures.features || null);
          } else {
            // console.log("--- change mode : select_feature")
            this.changeMode('select_feature', {
              selectHighlightColor: 'yellow',
              onSelect(state) {
                goSplitMode(state.draw, [{
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
        disabled: controls.split_line_polygon==false,
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

          function goSplitMode(draw,selectedFeatures) {
            try {
              draw?.changeMode('split_polygon', {
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
            goSplitMode(this,selectedFeatures.features || null);
          } else {
            // console.log("--- change mode : select_feature")
            this.changeMode('select_feature', {
              selectHighlightColor: 'yellow',
              onSelect(state) {
                console.log("---- this : ", this)
                goSplitMode(state.draw,[{
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
        disabled: controls.split_polygon==false,
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

          function goCutPolygonMode(draw,selectedFeatures) {
            try {
              // this.changeMode('cut_polygon');
              draw?.changeMode('cut_polygon', {
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
            goCutPolygonMode(this,selectedFeatures.features || null);
          } else {
            // console.log("--- change mode : select_feature")
            this.changeMode('select_feature', {
              selectHighlightColor: 'yellow',
              onSelect(state) {
                // console.log("--- state : ", state)
                goCutPolygonMode(state.draw,[{
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
        disabled: controls.cut_polygon==false,
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
        disabled: controls.scale_rotate==false,
      },
      {
        //===== Pinning
        on: 'click',
        action: () => {
          this.changeMode('pinning_mode');
        },
        classes: ['pinning_mode'],
        title: 'Pinning Mode tool',
        disabled: controls.pinning==false,
      },
      {
        //===== combine
        on: "click",
        action: () => {
          this.combineFeatures();
        },
        classes: ["mapbox-gl-draw_combine"],
        title: "Combine",
        disabled: controls.combine==false,
      },
      {
        //===== Trash
        on: "click",
        action: () => {
          this.uncombineFeatures();
        },
        classes: ["mapbox-gl-draw_uncombine"],
        title: "Uncombine",
        disabled: controls.uncombine==false,
      },
      {
        //===== Trash
        on: "click",
        id: "trash",
        action: () => {
          this.trash();
        },
        classes: ["mapbox-gl-draw_trash"],
        title: "Trash",
        disabled: controls.trash==false,
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
      this.elContainer.classList.add(this.options.horizontal?"horizontal":"vertical")
      this.elContainer.classList.add(this.options.edge)
      this.elContainer.classList.add('custom-tools-group')

      this.buttons.forEach((b) => {
        !b.disabled&&this.addButton(b);
      });

      addOtherControls(map, this, placement, controls);
      addExtraHandling(map, this)

      this.instruction_elContainer = document.createElement('div')
      this.instruction_elContainer.id = 'instruction-container'

      this.group_elContainer = document.createElement('div')
      this.group_elContainer.id = 'custom-tools-container'
      this.group_elContainer.className = 'custom-tools-container' + (this.options.horizontal?" horizontal":" vertical")
      this.group_elContainer.appendChild(this.instruction_elContainer)
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
        // document.getElementById("trash").click();
        e.preventDefault();
        e.stopPropagation();
        const clickedButton = e.target;
        if (clickedButton === this.activeButton) {
          // elButton?.classList?.remove("active")
          this.deactivateButtons();
          document.getElementById("trash").click();
          return;
        } else {
          this.changeMode("simple_select",{})
          document.getElementById("trash").click();
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
      document.getElementById("instruction-container").innerHTML="";
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


  map.on('draw.instruction', function (e) {
    console.log("----- on draw.instruction > action | msg : ", e.action, e.message);

    document.getElementById("instruction-container").innerHTML=`${e.action} : ${e.message}`;



  });
}

const addOtherControls = async (map, draw, placement, controls) => {

  console.log("---- draw.options : ", draw.options)
  const snapOptionsBar = new OptionsToolbar({
    draw,
    checkboxes: [
      {
        on: 'change',
        id: 'snap',
        action: (e) => {
          draw.options.snap = e.target.checked;
          if (e.target.checked) {
            draw.options.guides = false;
            document.getElementById("guides").checked = false;
          }
          // console.log("---- snap | guides : ", draw.options?.snap, draw.options?.guides)
        },
        classes: ['snap_mode', 'snap'],
        title: 'Snap when Draw',
        initialState: draw?.options?.snap?'checked':'unchecked',
        disabled: controls.snap==false,
      },
      {
        on: 'change',
        id: 'guides',
        action: (e) => {
          draw.options.guides = e.target.checked;
          if (e.target.checked) {
            draw.options.snap = false;
            document.getElementById("snap").checked = false;
          }
          // console.log("---- snap | guides : ", draw.options?.snap, draw.options?.guides)
        },
        classes: ['snap_mode', 'grid'],
        title: 'Show Guides',
        initialState: draw?.options?.guides?'checked':'unchecked',
        disabled: controls.guides==false,
      },
    ],
  });

  const fileOptionsBar = new OptionsToolbar({
    draw,
    checkboxes: [
      {
        on: 'click',
        id: 'import',
        action: (e) => {
          if (!document.getElementById('import')?.innerHTML) {
            console.log("---- attach form !!!")
            // let _form = document.createElement('form');
            // _form.action = "{{ url_for('upload') }}"
            // _form.method="POST"
            // _form.enctype="multipart/form-data"
            let _input = document.createElement('input');
            _input.id="selectFiles"
            _input.classList="mapbox-gl-draw_ctrl-draw-btn file-input-hidden"
            _input.type="file"
            _input.name="file"
            _input.accept="application/JSON" //"image/*"
            _input.onchange=(e)=>{
              console.log("--- input onchange : ",e )
              var files = document.getElementById('selectFiles').files;
              console.log(files);
              if (files.length <= 0) {
                return false;
              }
              
              var fr = new FileReader();
              
              fr.onload = function(e) { 
              console.log(e);
                var result = JSON.parse(e.target.result);
                console.log("--- import file : ",result)
                if (result?.type=="FeatureCollection" && result?.features?.length) {
                  draw.set(result)
                } else {
                  console.log("---- unable to import file : ", file)
                  alert("the imported file has incorrect format !!!")
                }
                // var formatted = JSON.stringify(result, null, 2);
                // document.getElementById('result').value = formatted;
              }
              
              fr.readAsText(files.item(0));
            }
            document.getElementById('import').append(_input)
            _input.click()
          }
          console.log("---- import : ")
          // draw.options?.guides = e.target.checked;



        },
        classes: ['file-import', 'load'],
        title: 'Export GeoJson',
        disabled: controls.export==false,
      },
      {
        on: 'click',
        id: 'export',
        action: (e) => {
          // draw.options?.snap = e.target.checked;
          var data = draw.getAll();

          if (data.features.length > 0) {
              // Stringify the GeoJson
              var convertedData = 'text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));
              // Create export
              if (!document.getElementById('export')?.innerHTML) {
                console.log("---- attach link !!!")
                let _a = document.createElement('a');
                _a.id = "export-file";
                _a.setAttribute('href', 'data:' + convertedData);
                _a.setAttribute('download','data.json'); 
                document.getElementById('export').append(_a)  
              } 
              !draw.options?.onExport&&document.getElementById('export-file')?.click();
          } else {
              alert("no data found!!!");
          }
          console.log("---- exported data : ", data)
          draw.options?.onExport&&draw.options?.onExport(data)
        },
        classes: ['file-export', 'save'],
        title: 'Import GeoJson',
        disabled: controls.import==false,
      },
    ],
  });

  setTimeout(() => {
    (controls.additional_tools!=false)&&map.addControl(additionalTools({...draw, controls}), placement);
    (controls.snap_tools!=false)&&map.addControl(snapOptionsBar, placement);
    (controls.file_tools!=false)&&map.addControl(fileOptionsBar, placement);

    setTimeout(()=>draw.groups_item?.map((el)=>{draw.group_elContainer.appendChild(el)}),10);
  }, 400);
};