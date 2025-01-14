import MapboxDraw from '@mapbox/mapbox-gl-draw';
import defaultDrawStyle from '@mapbox/mapbox-gl-draw/src/lib/theme';
import * as Constants from '@mapbox/mapbox-gl-draw/src/constants';
import unionBy from 'lodash.unionby';
import SelectFeatureMode, { drawStyles as selectFeatureDrawStyles } from './lib/mapbox-gl-draw-select-mode';
import { SnapPolygonMode, SnapPointMode, SnapLineMode, SnapModeDrawStyles } from './lib/mapbox-gl-draw-snap-mode';
import mapboxGlDrawPinningMode from './lib/mapbox-gl-draw-pinning-mode';
import * as mapboxGlDrawPassingMode from './lib/mapbox-gl-draw-passing-mode';
import { SRMode, SRCenter, SRStyle } from './lib/mapbox-gl-draw-scale-rotate-mode';
import SplitPolygonMode, { drawStyles as splitPolygonDrawStyles } from './lib/mapbox-gl-draw-split-polygon-mode';
import CutPolygonMode, { drawStyles as cutPolygonDrawStyles } from './lib/mapbox-gl-draw-cut-polygon-mode';
import SplitLineMode, {drawStyles as splitLineDrawStyles } from './lib/mapbox-gl-draw-split-line-mode';
import PaintMode, { drawStyles as paintDrawStyles } from './lib/mapbox-gl-draw-paint-mode';
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
import DragCircleMode from './lib/mapbox-gl-draw-drag-circle-mode';
import DragEllipseMode from './lib/mapbox-gl-draw-drag-ellipse-mode';
import StaticMode, {drawStyles as staticStyles} from './lib/mapbox-gl-draw-static-mode';

import colorPickerDrawStyle from './lib/color-picker/customDrawStyles.js';
import customActiveDrawStyle from './customActiveDrawStyles.js';


// import MapboxCircle from 'mapbox-gl-circle';
// const MapboxCircle = require('mapbox-gl-circle');
require('@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css');
require('./custom-draw-tools.css');
import { addOtherControls } from './addOthercontrols.js';
import { addExtraHandling } from './addExtraHandling.js'
import defaultIcons from './icons.js';

// import SimpleSelectMode from '@mapbox/mapbox-gl-draw/src/modes/simple_select';

export default class MapboxDrawPro extends MapboxDraw {

  
  constructor(options) {
    options = options || {};
    const { modes, styles, controls={}, icons=[], iconGroups=[], disableDefaultIcons=false, otherOptions, customSetFeature, useCustomActiveDrawStyle, customDrawStyles=[], ...other } = options;

    localStorage.setItem("useCustomActiveDrawStyle",useCustomActiveDrawStyle?"1":"0");

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
      // simple_select: SimpleSelectMode,
      simple_select: SimpleSelectModeBezierOverride,
      direct_select: DirectModeBezierOverride,
      // simple_select: SimpleSelectModeOverride,
      // direct_select: DirectModeOverride,
      draw_bezier_curve: DrawBezierCurve,
      drag_circle: DragCircleMode({...otherOptions?.circle||{}}),
      drag_ellipse: DragEllipseMode({...otherOptions?.ellipse||{}}),
    };

    const customOptions = {
      horizontal: true,
      edge: "bottom",

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
    const __styles = [...customActiveDrawStyle(staticStyles(paintDrawStyles(cutPolygonDrawStyles(splitPolygonDrawStyles(splitLineDrawStyles(selectFeatureDrawStyles(colorPickerDrawStyle(defaultDrawStyle))))))),useCustomActiveDrawStyle,customDrawStyles||{})];
    const _styles = unionBy(__styles, styles, RectRestrictStyles, SnapModeDrawStyles, SRStyle, addToolStyle, bezierStyles, 'id');
    // console.log("---- styles : ", __styles)
    // console.log("---- styles : ", _styles)
    const _icons = icons.concat(defaultIcons).filter((icon)=>icon.name&&icon.url&&(!disableDefaultIcons||icon.group!='default'))
    const _iconGroups = (!disableDefaultIcons?['default']:[]).concat(iconGroups)
    // console.log("---- _icons : ", _icons)
    const _options = { modes: _modes, styles: _styles, controls:_controls, icons:_icons, iconGroups:_iconGroups, customSetFeature, ...customOptions, ...otherOptions };
    // console.log("--- options : ", _options)
    super(_options);


    this.buttons = [
      {
        //===== point
        on: "click",
        persist: true,
        id: "point",
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
        persist: true,
        id: "line",
        action: () => {
          this.changeMode('draw_line_string');
          this.map?.fire("draw.instruction",{
            action:"วาดเส้น",
            message:"คลิกเพื่อกำหนดจุดบนเส้น คลิกสองครั้งเมื่อเสร็จสิ้น", 
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
        persist: true,
        id: "polygon",
        action: () => {
          this.changeMode('draw_polygon');
          this.map?.fire("draw.instruction",{
            action:"วาดรูปหลายเหลี่ยม",
            message:"คลิกเพื่อกำหนดจุดยอด คลิกสองครั้งเมื่อเสร็จสิ้น", 
          })
        },
        classes: ["mapbox-gl-draw_polygon"],
        id: "draw-polygon-tool",
        title: "Polygon",
        disabled: controls.polygon==false,
      },
      {
        on: "click", 
        persist: true,
        id: 'bezier',
        action: () => {
          this.changeMode("draw_bezier_curve")
          this.map?.fire("draw.instruction",{
            action:"วาดเส้น bezier",
            message:"คลิกเพื่อกำหนดจุดบนเส้น คลิกสองครั้งเมื่อเสร็จสิ้น คลิกเลือกจุด กด alt+ลาก เพื่อแสดง bezier handle", 
          })
        }, 
        classes: ["bezier-curve-icon"], 
        title:'Bezier tool',
        disabled: controls.bezier==false,
      },
      {
        //===== drag circle
        on: "click",
        persist: true,
        id: "circle",
        action: () => {
          this.changeMode('drag_circle',{...otherOptions?.circle||{}});
          this.map?.fire("draw.instruction",{
            action:"วาดวงกลม",
            message:otherOptions?.circle?.mode==2?"คลิกและลากเพื่อสร้างวงกลม":"คลิกเพื่อกำหนดจุดศูนย์กลาง คลิกอีกครั้งเพื่อกำหนดรัศมี", 
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
        persist: true,
        id: "ellipse",
        action: () => {
          this.changeMode('drag_ellipse', { eccentricity: 0.8, divisions: 60, ...otherOptions?.ellipse||{} });
          this.map?.fire("draw.instruction",{
            action:"วาดวงรี",
            message:otherOptions?.ellipse?.mode==2?"คลิกและลากเพื่อสร้างวงรี":"คลิกเพื่อกำหนดจุดศูนย์กลาง คลิกอีกครั้งเพื่อกำหนดรัศมี", 
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
        persist: true,
        id: "rectangle",
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
          input.value = this.options?.rectangleDefaultLimit || null;
 
          var elButton1 = document.createElement('button');
          elButton1.className = 'mapbox-gl-draw_ctrl-draw-btn fixed';
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
        persist: true,
        id: "assisted_rectangle",
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
        persist: true,
        id: "paint",
        action: () => {
          try {
            this.changeMode("draw_paint_mode",{...otherOptions?.paint||{}});
            console.log('----- paint action')
            // console.log("------ : ", this , otherOptions?.paint?.mode==2?"คลิกเพื่อเริ่ม ลากเพื่อวาด และคลิกสองครั้งเพื่อสิ้นสุด":"คลิกค้างเพื่อลากเส้น")
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
        //===== Freeform Polygon
        on: 'click',
        persist: true,
        id: "freehand",
        action: () => {
          try {
            this.changeMode('freehandMode');
            this.map?.fire("draw.instruction",{
              action:"วาดรูปหลายเหลี่ยมแบบอิสระ",
              message:"คลิกเพื่อกำหนดจุดยอด คลิกค้างลากเพื่อวาดเส้น และหยุดคลิกเพื่อสิ้นสุด", 
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
        id: "split_line_line",
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
              draw.map?.fire("draw.instruction",{
                action:"ตัดแยกเส้นด้วยเส้น",
                message:"คลิกเพื่อกำหนดจุดบนเส้นตัด คลิกสองครั้งเพื่อสิ้นสุด", 
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
                console.log("--- onselect state : ", state)
                // let selectedFeatures = state.draw.getSelected()
                // setTimeout(()=>goSplitMode(state.draw,selectedFeatures.features || null),100);
                goSplitMode(state.draw,[{
                  id: state.selectedFeatureID,
                  type:"Feature",
                  geometry:state.selectedFeature?._geometry,
                  properties:{user_portColor: state.selectedFeature?.properties?.user_portColor, user_portIcon: state.selectedFeature?.properties?.user_portIcon }
                }]);
              },
              types2Select:["LineString", "MultiLineString"]
            });
            this.map?.fire("draw.instruction",{
              action:"ตัดแยกเส้นด้วยเส้น",
              message:"เลือกเส้นที่ต้องการตัดแยก", 
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
        id: "split_line_polygon",
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
              draw.map?.fire("draw.instruction",{
                action:"ตัดแยกเส้นด้วยรูปหลายเหลี่ยม",
                message:"คลิกเพื่อกำหนดจุดรูปหลายเหลี่ยม คลิกสองครั้งเพื่อสิ้นสุด", 
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
                goSplitMode(state.draw, [{
                  id: state.selectedFeatureID,
                  type:"Feature",
                  geometry:state.selectedFeature?._geometry,
                  properties:{}
                }]);
              },
              types2Select:["LineString", "MultiLineString"]
            });
            this.map?.fire("draw.instruction",{
              action:"ตัดแยกเส้นด้วยรูปหลายเหลี่ยม",
              message:"เลือกเส้นที่ต้องการตัดแยก", 
            })
          }
        },
        classes: ['split-line-polygon'],
        title: 'Split Line Mode tool (by polygon)',
        disabled: controls.split_line_polygon==false,
      },
      {
        //===== Split Polygon
        on: 'click',
        id: "split_polygon",
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
              draw.map?.fire("draw.instruction",{
                action:"ตัดแยกรูปหลายเหลี่ยมด้วยเส้น",
                message:"คลิกเพื่อกำหนดจุดบนเส้นตัด คลิกสองครั้งเพื่อสิ้นสุด", 
              })
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
            this.map?.fire("draw.instruction",{
              action:"ตัดแยกรูปหลายเหลี่ยมด้วยเส้น",
              message:"เลือกรูปหลายเหลี่ยมที่ต้องการตัดแยก", 
            })
          }
        },
        classes: ['split-polygon'],
        title: 'Split Polygon Mode tool',
        disabled: controls.split_polygon==false,
      },
      {
        //===== Cut Polygon
        on: 'click',
        id: "cut_polygon",
        action: () => {

          const selectedFeatureIDs = this.getSelectedIds();
          // console.log("----- selectedFeatureIDs : ", selectedFeatureIDs)

          function goCutPolygonMode(draw,selectedFeatures) {
            try {
              // this.changeMode('cut_polygon');
              draw?.changeMode('cut_polygon', {
                features: selectedFeatures,
                highlightColor: '#222',
              });
              draw.map?.fire("draw.instruction",{
                action:"ตัดรูปหลายเหลี่ยม",
                message:"คลิกเพื่อกำหนดจุดรูปหลายเหลี่ยมที่ใช้ตัด คลิกสองครั้งเพื่อสิ้นสุด", 
              })
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
            this.map?.fire("draw.instruction",{
              action:"ตัดรูปหลายเหลี่ยม",
              message:"เลือกรูปหลายเหลี่ยมที่ต้องการตัด", 
            })
          }
        },
        classes: ['cut-polygon'],
        title: 'Cut Polygon Mode tool',
        disabled: controls.cut_polygon==false,
      },
      {
        //===== Scal&Rotate
        on: 'click',
        id: "scale_rotate",
        action: () =>{
          // const selectedFeatureIDs = this.getSelectedIds();
          // if (selectedFeatureIDs?.length > 0) {
          //   try {
          //     this.changeMode('scaleRotateMode', {
          //       // required
          //       canScale: true,
          //       canRotate: true, // only rotation enabled
          //       canTrash: false, // disable feature delete
        
          //       rotatePivot: SRCenter.Center, // rotate around center
          //       scaleCenter: SRCenter.Opposite, // scale around opposite vertex
        
          //       singleRotationPoint: true, // only one rotation point
          //       rotationPointRadius: 1.2, // offset rotation point
        
          //       canSelectFeatures: true,
          //     });
          //     this.map?.fire("draw.instruction",{
          //       action:"ย่อ/ขยาย และหมุน",
          //       message:"ลากลูกศรตรง เพื่อย่อ/ขยาย ลากลูกศรวงกลมเพื่อหมุน", 
          //     })
          //   } catch (err) {
          //     alert(err.message);
          //     console.error(err);
          //   }
          // } else {
          //   document.getElementById('scale_rotate').click()
          //   this.map?.fire("draw.instruction",{
          //     action:"ย่อ/ขยาย และหมุน",
          //     message:"*** ต้องเลือกเส้น/รูปหลายเหลี่ยม ก่อนจึงสามารถดำเนินการต่อได้ ***", 
          //   })
          // }



          const selectedFeatureIDs = this.getSelectedIds();
          // console.log("----- selectedFeatureIDs : ", selectedFeatureIDs)

          function goScaleRotateMode(draw,selectedFeatures) {
            console.log("---- selectedFeatures : ", selectedFeatures)
            try {
              draw.changeMode('scaleRotateMode', {
                feature: selectedFeatures[0],
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
              draw.map?.fire("draw.instruction",{
                action:"ย่อ/ขยาย และหมุน",
                message:"ลากลูกศรตรง เพื่อย่อ/ขยาย ลากลูกศรวงกลมเพื่อหมุน", 
              })
            } catch (err) {
              alert(err.message);
              console.error(err);
            }
            
          }

          if (selectedFeatureIDs?.length > 0) {
            let selectedFeatures = this.getSelected()
            goScaleRotateMode(this,selectedFeatures.features || null);
          } else {
            // console.log("--- change mode : select_feature")
            this.changeMode('select_feature', {
              selectHighlightColor: 'yellow',
              onSelect(state) {
                // console.log("--- state : ", state)
                state.draw.changeMode('simple_select', {featureIds: [state.selectedFeatureID]})
                goScaleRotateMode(state.draw,[{
                  id: state.selectedFeatureID,
                  type:"Feature",
                  geometry:state.selectedFeature?._geometry,
                  properties:{}
                }]);
                // goCutPolygonMode(null)
              },
              types2Select:["LineString", "MultiLineString","Polygon","MultiPolygon"]
            });
            this.map?.fire("draw.instruction",{
              action:"ย่อ/ขยาย และหมุน",
              message:"เลือกเส้น หรือ รูปหลายเหลี่ยมที่ต้องการ ย่อ/ขยาย/หมุน", 
            })
          }



        },
        classes: ['rotate-icon'],
        title: 'Scale and Rotate Mode tool',
        disabled: controls.scale_rotate==false,
      },
      {
        //===== Pinning
        on: 'click',
        id: "pinning",
        action: () => {
          this.changeMode('pinning_mode');
          this.map?.fire("draw.instruction",{
            action:"เลื่อนจุดร่วม",
            message:"เลือกจุดร่วมระหว่างรูป และลากเพื่อย้ายตำแหน่งพร้อมกัน", 
          })
        },
        classes: ['pinning_mode'],
        title: 'Pinning Mode tool',
        disabled: controls.pinning==false,
      },
      {
        //===== combine
        on: "click",
        id: "combine",
        action: () => {
          this.combineFeatures();
          this.map?.fire("draw.instruction",{
            action:"รวมกลุ่ม",
            message:"รวมกลุ่มรูปร่างที่เลือก (กด shift ค้าง เพื่อเลือกรูปร่างหลายรูปร่าง)", 
          })
        },
        classes: ["mapbox-gl-draw_combine"],
        title: "Combine",
        disabled: controls.combine==false,
      },
      {
        //===== Uncombine
        on: "click",
        id: "uncombine",
        action: () => {
          this.uncombineFeatures();
          this.map?.fire("draw.instruction",{
            action:"แยกกลุ่ม",
            message:"แยกกลุ่มรูปร่างที่เลือก", 
          })
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
          // this.map?.fire("draw.instruction",{
          //   action:"ลบรูปร่าง",
          //   message:"ลบรูปร่างที่เลือก (กด shift ค้าง เพื่อเลือกรูปร่างหลายรูปร่าง)", 
          // });
          document.getElementById("instruction-container").innerHTML="";
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
      console.log("==== placement : ", placement)
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

      // --- instruction container
      this.instruction_elContainer = document.createElement('div')
      this.instruction_elContainer.id = 'instruction-container'

      // --- color picker container
      this.pallete_elContainer = document.createElement('div')
      this.pallete_elContainer.id="pallete-container";
      this.pallete_elContainer.className="pallete-container hidden" + (this.options?.colorPalleteAlwaysOn?" always-visible":"");

      this.selector1_elContainer = document.createElement('div');
      this.selector1_elContainer.id="icon-selector-panel";   
      this.selector1_elContainer.className="grid-container";   
      this.selector2_elContainer = document.createElement('div');
      this.selector2_elContainer.id="icon-selector-group";
      this.selector2_elContainer.className="grid-container";   
      this.selector_elContainer = document.createElement('div');
      this.selector_elContainer.id="icon-selector";
      this.selector_elContainer.append(this.selector1_elContainer);
      this.selector_elContainer.append(this.selector2_elContainer);
      this.spaceEl = document.createElement('div')
      this.spaceEl.id="spacing";
      this.icon_el = document.createElement('img')
      this.icon_el.className="icon-image";
      this.icon_el.id="selected-icon";
      this.icondisplay_elContainer = document.createElement('div')
      this.icondisplay_elContainer.id="icon-display";
      this.icondisplay_elContainer.className = "clr-field";
      this.icondisplay_elContainer.append(this.icon_el)
      this.icon_elContainer = document.createElement('div')
      this.icon_elContainer.className="icon-container";
      this.icon_elContainer.id="icon-container";
      this.icon_elContainer.append(this.selector_elContainer);
      this.icon_elContainer.append(this.spaceEl);
      this.icon_elContainer.append(this.icondisplay_elContainer);

      this.text_input = document.createElement('input');
      this.text_input.type="text";
      this.text_input.placeholder="text";
      this.text_input.id="text-input";
      this.text_input.addEventListener('focusout', (e)=>{
        // setTimeout(()=>document.getElementById('text-input-container').style.display = 'none',1000);
      });
      this.text_button = document.createElement('button');
      this.text_button.id="text-button";
      this.text_button.innerHTML="Apply";
      // this.text_button.addEventListener('click', (e)=>{
      //   let text = document.getElementById('text-input').value;
      //   console.log("===== text : ", text)
      //   // document.getElementById('text-input-container').style.display = 'none';
      // });

      this.text_input_elContainer = document.createElement('div');
      this.text_input_elContainer.id="text-input-container";
      this.text_input_elContainer.append(this.text_input);
      this.text_input_elContainer.append(this.text_button);
      this.spaceEl = document.createElement('div')
      this.spaceEl.id="spacing";

      this.textdisplay_elContainer = document.createElement('div')
      this.textdisplay_elContainer.id="text-display";
      this.textdisplay_elContainer.className = "text-icon clr-field";
      this.textdisplay_elContainer.addEventListener('click', (e)=>{
        let display = document.getElementById('text-input-container').style.display;
        if (display!='flex') {
          document.getElementById('text-display').classList.add('active');
          document.getElementById('text-input-container').style.display = 'flex';
        } else {
          document.getElementById('text-display').classList.remove('active');
          document.getElementById('text-input-container').style.display = 'none';
        }
        // document.getElementById('text-input-container').style.display = (display!='flex'?'flex':'none');
        document.getElementById('text-input').focus()
      });
      this.text_elContainer = document.createElement('div')
      this.text_elContainer.className="text-container";
      this.text_elContainer.id="text-container";

      this.text_elContainer.append(this.text_input_elContainer);
      this.text_elContainer.append(this.textdisplay_elContainer);
      this.text_elContainer.append(this.spaceEl);


      this.colorpicker_elContainer = document.createElement('div')
      this.colorpicker_elContainer.className="color-picker-container square";
      this.colorpicker_elContainer.id="color-picker-container";
      let colorInput = document.createElement('input');
      colorInput.type = 'text';
      colorInput.id = "color-picker";
      colorInput.className = 'coloris instance1';
      colorInput.value = "#00a5cc";
      // colorInput.addEventListener("change", (e)=>console.log("--- color change !!! : ", e.target?.value))
      this.colorpicker_elContainer.append(colorInput)

      this.pallete_elContainer.append(this.icon_elContainer)
      this.pallete_elContainer.append(this.text_elContainer)
      this.pallete_elContainer.append(this.colorpicker_elContainer)

      this.group_elContainer = document.createElement('div')
      this.group_elContainer.id = 'custom-tools-container'
      this.group_elContainer.className = 'custom-tools-container' + (this.options.horizontal?" horizontal":" vertical")
      this.group_elContainer.appendChild(this.instruction_elContainer)
      this.group_elContainer.appendChild(this.elContainer)
      this.group_elContainer.appendChild(this.pallete_elContainer)

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
      elButton.addEventListener((this.options?.persistModeOnClick&&opt.persist)?"contextmenu":opt.on, (e)=>{
        
        e.preventDefault();
        e.stopPropagation();
        const clickedButton = e.target;

        if (this.persist) {
          if (this.persist==clickedButton.id) {
            // console.log("--- turn off persist : ", this.persist, clickedButton.id)
          } else {
            // console.log("--- persist is on : ", this.persist, clickedButton.id)
            return;
          }
        } else {
          // console.log("--- persist is off : ", this.persist, clickedButton.id)
        }

        if (clickedButton === this.activeButton) {
          // console.log("---- old id")
          // elButton?.classList?.remove("active")
          this.deactivateButtons();
          this.persist=null
          this.persist_button=null
          this.persist_action=null
          clickedButton.classList.remove("persist");
          this.changeMode("simple_select",{})
          document.getElementById("trash").click();
          return;
        } else {
          // console.log("---- new id", clickedButton)
          if (!['trash', 'combine', 'uncombine', 'split_line_line', 'split_line_polygon', 'split_polygon', 'cut_polygon', 'scale_rotate', 'pinning'].includes(clickedButton?.id)) {
            // console.log("--- change simple select mode")
            this.changeMode("simple_select",{})
          }
          // document.getElementById("trash").click();
        }
        // elButton?.classList?.add("active")
        this.setActiveButton(opt.title)
        opt.action(e)
      }, true);

      (this.options?.persistModeOnClick||opt.persist)&&elButton.addEventListener((this.options?.persistModeOnClick&&opt.persist)?opt.on:"contextmenu", (e)=>{

        e.preventDefault();
        // console.log("---- context menu")
        e.stopPropagation();
        const clickedButton = e.target;

        if (this.options?.persistModeOnClick&&opt.persist) {
          let isCancel = (clickedButton?.id === this.activeButton?.id);
          console.log("----- cancel persisit : ", clickedButton?.id, this.activeButton?.id, isCancel)
          this.deactivateButtons();
          this.persist=null
          this.persist_button=null
          this.persist_action=null
          clickedButton.classList.remove("persist");
          this.changeMode("simple_select",{})
          document.getElementById("trash").click();
          if (isCancel) {
            console.log("----- cancel persisit : ", clickedButton)
            return;
          }
        }

        if (clickedButton === this.activeButton && this.persist==clickedButton.id && !this.options?.persistModeOnClick) {
          // console.log("---- old id")
          // this.deactivateButtons();
          // this.changeMode("simple_select",{})
          // document.getElementById("trash").click();
          return;
        } else {
          // console.log("---- new id", clickedButton)
          if (!['trash', 'combine', 'uncombine', 'split_line_line', 'split_line_polygon', 'split_polygon', 'cut_polygon', 'scale_rotate', 'pinning'].includes(clickedButton?.id)) {
            // console.log("--- change simple select mode")
            this.changeMode("simple_select",{})
          }
          // document.getElementById("trash").click();
        }
        // elButton?.classList?.add("active")
        this.setActiveButton(opt.title)
        opt.persist&&(this.persist=opt.id)
        opt.persist&&(this.persist_button=opt)
        opt.persist&&(this.persist_action=opt.action)
        clickedButton.classList.add("persist");
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
      console.log("--- deactivateButtons ")
      document.getElementById("instruction-container").innerHTML="";
    }

    this.activateUIButton = (id) => {console.log("--- activateUIButton : ", id)}
  
    this.setActiveButton = (id) => {
      // console.log("-------- setActiveButton persist ")
      // console.log("--- setActiveButton persist : ", this.persist)
      // console.log("--- setActiveButton id : ", id)
      this.map?.fire('draw.activebutton', {
        id: id
      })
      // console.log("--- setActiveButton curActiveButton : ", this.curActiveButton)
      if (this.persist) {
        // console.log("--- this.persist_button : ", this.persist_button)
        setTimeout(this.persist_action, 500);
        return;
      }
      this.curActiveButton = id
      this.deactivateButtons();
  
      const button = this.buttonElements[id];
      if (!button) return;
  
      if (button && !['Trash', 'Combine', 'Uncombine'].includes(id)) {
        button.classList.add(Constants.classes.ACTIVE_BUTTON);
        this.activeButton = button;
      } else {
        document.getElementById("pallete-container").classList.add("hidden")
      }
    }


    this.removeButton = (opt) => {
      opt.elButton.removeEventListener(opt.on, opt.action);
      opt.elButton.remove();
    };

  }
}
