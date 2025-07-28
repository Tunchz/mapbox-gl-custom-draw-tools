import { additionalTools, measurement, addToolStyle } from './lib/mapbox-gl-draw-additional-tools';
import MeasureControl from './lib/mapboxgl-measure-control/measure_control'

class OptionsToolbar {
    constructor(opt) {
      let ctrl = this;
      ctrl.checkboxes = opt.checkboxes || [];
      ctrl.onRemoveOrig = opt.draw.onRemove;
      ctrl.horizontal = opt.draw.options?.horizontal;
      ctrl.edge = opt.draw.options?.edge;
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
      elCheckbox.addEventListener(opt.on, (e)=>{
  
        const clickedButton = e.target;
        // console.log("---- e.target ", clickedButton.id)
        if (['static'].includes(clickedButton.id)) {
          if (clickedButton.id === this.activeButton) {
            // console.log("---- old id", clickedButton.id)
            ctrl.draw.changeMode("simple_select",{})
            // document.getElementById("trash").click();
            clickedButton.classList.remove("active");
            this.activeButton = null
            return;
          } else {
            // console.log("---- new id", clickedButton.id)
            // document.getElementById("trash").click();
            clickedButton.classList.add("active");
            this.activeButton = clickedButton.id
          }
        } else {
          this.actionButton = null
        }
        opt.action(e)
      });
  
      ctrl.elContainer.appendChild(elCheckbox);
      opt.elCheckbox = elCheckbox;
    }
    removeButton(opt) {
      opt.elCheckbox.removeEventListener(opt.on, opt.action);
      opt.elCheckbox.remove();
    }
  }
  


export const addOtherControls = async (map, draw, placement, controls) => {

    // console.log("==== placement addOtherControls : ", placement)
    // console.log("---- draw.options : ", draw.options)
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
              // console.log("---- attach form !!!")
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
                // console.log(files);
                if (files.length <= 0) {
                  return false;
                }
                
                var fr = new FileReader();
                
                fr.onload = function(e) { 
                // console.log(e);
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
            // console.log("---- import : ")
            // draw.options?.guides = e.target.checked;
  
  
  
          },
          classes: ['file-import', 'load',"fixed"],
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
                  // console.log("---- attach link !!!")
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
          classes: ['file-export', 'save',"fixed"],
          title: 'Import GeoJson',
          disabled: controls.import==false,
        },
        {
          //===== static mode
          on: "click",
          id: "static",
          action: () => {
            draw.changeMode('static');
            // this.map?.fire("draw.instruction",{
            //   action:"วาดจุด",
            //   message:"คลิกเพื่อกำหนดจุด", 
            // })
          },
          classes: ["static-mode","fixed"],
          title: "static mode",
          disabled: controls.static==false,
        },
      ],
    });
  
    const measureControl = new MeasureControl({draw});
    
    setTimeout(() => {
      (controls.additional_tools!=false)&&map.addControl(additionalTools({...draw, controls}), placement);
      (controls.measure_controls!=false)&&map.addControl(measureControl, placement);
      (controls.snap_tools!=false)&&map.addControl(snapOptionsBar, placement);
      (controls.file_tools!=false)&&map.addControl(fileOptionsBar, placement);
    // (controls.measure_controls!=false)&&map.addControl(measureControl, placement);
  
      setTimeout(()=>draw.groups_item?.map((el)=>{draw.group_elContainer.appendChild(el)}),10);
    }, 400);
  };

