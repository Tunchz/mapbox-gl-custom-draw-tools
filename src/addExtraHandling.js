require('./lib/color-picker/coloris.js');
require('./lib/color-picker/coloris.css');

export const addExtraHandling = (map, draw) => {


    map.on('draw.instruction', function (e) {
      // console.log("----- on draw.instruction > action | msg : ", e.action, e.message);
  
      // document.getElementById("instruction-container").innerHTML=`◉ ${e.action} ▶ ${e.message}`;
      document.getElementById("instruction-container").innerHTML=`▶ ${e.action} ◉ ${e.message}`;
  
  
  
    });
  
    
    //------ handleling change colors for each feature
    draw.newDrawFeature = false;
    draw.drawFeatureID = null;
    draw.colorFeatureIdMaps = {default: "#2165D1", last_selected: "#2165D1"};
  
    function changeColor(draw,color) {
      console.log("--- changeColor call !!!", draw, color)
      // console.log("--- draw | drawFeatureID", draw, draw.drawFeatureID)
      if (!color) {
        draw.colorFeatureIdMaps[draw.drawFeatureID] = null;
        draw?.setFeatureProperty(draw.drawFeatureID, 'portColor', undefined);
        draw?.setFeatureProperty(draw.drawFeatureID, 'portIcon', undefined);
        draw?.changeMode("simple_select", {})
        document.getElementById("pallete-container").classList.add("hidden")
        return
      } else {
        draw.colorFeatureIdMaps["last_selected"]=color
      }
      if (draw.drawFeatureID !== '' && typeof draw === 'object') {
  
        draw.colorFeatureIdMaps[draw.drawFeatureID] = color;
        draw.setFeatureProperty(draw.drawFeatureID, 'portColor', color);
        var feat = draw.get(draw.drawFeatureID);
        draw.add(feat)
      }
    }

    function changeText(draw, text) {
      console.log("---- text : ", text)
      draw.setFeatureProperty(draw.drawFeatureID, 'portText', text&&text!=""?text:undefined)
      document.getElementById("text-input").value = text;
      var feat = draw.get(draw.drawFeatureID);
      console.log("---- feat : ", feat)
      draw.add(feat)
    }

    function changeIcon(draw, icon) {
      console.log("---- icon : ", icon)

      draw.setFeatureProperty(draw.drawFeatureID, 'portIcon', icon.name!="remove image"&&icon.name||undefined)
      draw.setFeatureProperty(draw.drawFeatureID, 'portIconSize', icon.size||1)
      document.getElementById('selected-icon').src = icon.url
      
      var feat = draw.get(draw.drawFeatureID);
      console.log("---- feat : ", feat)
      draw.add(feat)
    }

    function changeGroup(draw, group) {
      console.log("---- group : ", group)

      Array.prototype.slice.call(document.getElementsByClassName('group-label'))?.forEach((el)=>el.classList.remove("selected"))
      document.getElementById('group-label-'+group).classList.add("selected")

      Array.prototype.slice.call(document.getElementsByClassName('icon-image'))?.forEach((el)=>el.classList.add("hidden"))
      Array.prototype.slice.call(document.getElementsByClassName('group_'+group))?.forEach((el)=>el.classList.remove("hidden"))

      // draw.setFeatureProperty(draw.drawFeatureID, 'portIcon', icon.name!="remove image"&&icon.name||undefined)
      // draw.setFeatureProperty(draw.drawFeatureID, 'portIconSize', icon.size||1)
      // document.getElementById('selected-icon').src = icon.url
      
      // var feat = draw.get(draw.drawFeatureID);
      // console.log("---- feat : ", feat)
      // draw.add(feat)
    }
  
    // callback for draw.update and draw.selectionchange
    var setDrawFeature = function(e) {
        console.log("----- setDrawFeatur !!!", e.features)
        if (e.features.length && e.features[0].type === 'Feature') {
            var feat = e.features[0];
            draw.drawFeatureID = feat.id;
            // if portColor not set, set to default color
            !feat?.properties?.portColor&&draw?.setFeatureProperty(draw.drawFeatureID, 'portColor', draw.colorFeatureIdMaps["default"]);
            // let featureColor = draw.colorFeatureIdMaps[draw.drawFeatureID] || draw.colorFeatureIdMaps["default"];
            let featureColor = feat?.properties?.portColor || draw.colorFeatureIdMaps["default"];
            let featureIcon = feat?.properties?.portIcon || "remove image";
            let featureText = feat?.properties?.portText || "";
            // console.log("---- new feature selected id | color | icon : ", draw.drawFeatureID, featureColor, featureIcon)
            document.getElementById("color-picker").value = featureColor;
            document.getElementById("color-picker").dispatchEvent(new Event('input', { bubbles: true }));
            document.getElementById('selected-icon').src = draw.options.icons?.find((i)=>i.name==featureIcon)?.url
            document.getElementById("pallete-container").classList.remove("hidden")
            document.getElementById("text-input").value = featureText;
            // Coloris.setColorFromStr(featureColor);
            // console.log("---- feat : ", feat)
            // document.getElementById('text-input-container').style.display=(featureText&&featureText!=""?"flex":"none");
            if (featureText&&featureText!="") {
              document.getElementById('text-display').classList.add('active');
              document.getElementById('text-input-container').style.display = 'flex';
            } else {
              document.getElementById('text-display').classList.remove('active');
              document.getElementById('text-input-container').style.display = 'none';
            }
            // console.log("---- text : ",document.getElementById('text-input-container').style.display)
            document.getElementById("text-container").style.visibility=(feat?.geometry?.type == "Point")?"visible":"visible";
            document.getElementById("icon-container").style.visibility=(feat?.geometry?.type == "Point")?"visible":"hidden";
            
        } else {
          console.log("---- hide color picker")
          document.getElementById("pallete-container").classList.add("hidden")
          document.getElementById("instruction-container").innerHTML="";
        }

    }
  
    /* Event Handlers for Draw Tools */
  
    map.on('draw.create', function() {
        draw.newDrawFeature = true;
    });
  
    map.on('draw.update', setDrawFeature);
  
    map.on('draw.selectionchange', setDrawFeature);
  
    map.on('click', function(e) {
        if (!draw.newDrawFeature) {
            var drawFeatureAtPoint = draw.getFeatureIdsAt(e.point);
  
            //if another drawFeature is not found - reset draw.drawFeatureID
            draw.drawFeatureID = drawFeatureAtPoint.length ? drawFeatureAtPoint[0] : '';
        }
  
        draw.newDrawFeature = false;
  
    });
  
    setTimeout(()=>{
      //--- initialize color-picker
      console.log("---- initialize color picker")
      Coloris({
        el: '.coloris',
        swatches: [
          "#2165D1",
          '#264653',
          '#2a9d8f',
          '#e9c46a',
          '#f4a261',
          '#e76f51',
          '#d62828',
          '#023e8a',
          '#0077b6',
          '#0096c7',
          '#00b4d8',
          '#48cae4'
        ]
      });
  
      /** Instances **/
  
      Coloris.setInstance('.instance1', {
        theme: 'polaroid',
        // themeMode: 'dark',
        // formatToggle: true,
        // closeButton: true,
        // clearButton: true,
        alpha: false,
        swatches: [
          "#2165D1",
          '#264653',
          '#2a9d8f',
          '#e9c46a',
          '#f4a261',
          '#e76f51',
          '#d62828',
          '#023e8a',
          '#0077b6',
          '#0096c7',
          '#00b4d8',
          '#48cae4'
        ],
        onChange: (color, input) => {
          console.log("---- color change : ", color);
          changeColor(draw, color)
        }
      });
  
      document.getElementById("color-picker-container").addEventListener("contextmenu", (e)=>{
        e.preventDefault();
        e.stopPropagation();
        console.log("--- context menu !!!");
        if (!draw.drawFeatureID) return;
        document.getElementById("color-picker").value = draw.colorFeatureIdMaps["default"]
        document.getElementById("color-picker").dispatchEvent(new Event('input', { bubbles: true }));
        // draw.colorFeatureIdMaps[draw.drawFeatureID] = null
        changeColor(draw, null)
  
      })


      document.getElementById('text-button').addEventListener('click', (e)=>{
        let text = document.getElementById('text-input').value;
        console.log("===== text : ", text);
        changeText(draw, text);
        // document.getElementById('text-input-container').style.display = 'none';
      });

      draw.options?.icons?.map((icon)=>{
        let imgel = document.createElement('img')
        imgel.className="icon-image" + (icon?.group?` group_${icon?.group}`:"");
        imgel.title=icon.name
        imgel.src=icon.url
        imgel.crossOrigin = "Anonymous"
        imgel.addEventListener("click",()=>changeIcon(draw, icon))
        imgel.addEventListener("contextmenu",()=>{changeIcon(draw, icon);icon.text&&changeText(draw, icon.text)})
        document.getElementById('icon-selector-panel').append(imgel)
      })

      draw.options?.iconGroups?.map((group)=>{
        let groupel = document.createElement('div')
        groupel.className="group-label";
        groupel.id="group-label-"+group;
        groupel.title=group
        groupel.innerHTML=group
        groupel.addEventListener("click",()=>changeGroup(draw, group))
        document.getElementById('icon-selector-group').append(groupel)
      })

      setTimeout(()=>(draw.options?.defaultSelectedGroup||draw.options?.iconGroups[0])&&changeGroup(draw, draw.options?.defaultSelectedGroup||draw.options?.iconGroups[0]),500);

    },500)
  
    //--- initialize all icons ---
    draw.options?.icons?.forEach((icon)=>{
      if (icon.name!=="remove image") {
        if (!icon.isSvg) {
          map.loadImage(icon.url, (error, image) => {
            if (error) throw error;
            console.log("----- icon : ", icon.name)
            image && !map.hasImage(icon.name) && map.addImage(icon.name, image);

          });
        } else {
          let img = new Image(icon.width||100,icon.height||100);
          img.onload = ()=>img && !map.hasImage(icon.name) && map.addImage(icon.name, img);
          img.src = icon.url;
          img.crossOrigin = "Anonymous"
        }
      }
    })
  
  
  
  }
  