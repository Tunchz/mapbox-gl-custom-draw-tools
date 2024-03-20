require('./lib/color-picker/coloris.js');
require('./lib/color-picker/coloris.css');

export const addExtraHandling = (map, draw) => {


    map.on('draw.instruction', function (e) {
      console.log("----- on draw.instruction > action | msg : ", e.action, e.message);
  
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

    function changeIcon(draw, icon) {
      console.log("---- icon : ", icon)

      draw.setFeatureProperty(draw.drawFeatureID, 'portIcon', icon.name!="remove image"&&icon.name||undefined)
      draw.setFeatureProperty(draw.drawFeatureID, 'portIconSize', icon.size||1)
      document.getElementById('selected-icon').src = icon.url
      
      var feat = draw.get(draw.drawFeatureID);
      console.log("---- feat : ", feat)
      draw.add(feat)
    }
  
    // callback for draw.update and draw.selectionchange
    var setDrawFeature = function(e) {
        // console.log("----- setDrawFeatur !!!", e.features)
        if (e.features.length && e.features[0].type === 'Feature') {
            var feat = e.features[0];
            draw.drawFeatureID = feat.id;
            // let featureColor = draw.colorFeatureIdMaps[draw.drawFeatureID] || draw.colorFeatureIdMaps["default"];
            let featureColor = feat?.properties?.portColor || draw.colorFeatureIdMaps["default"];
            let featureIcon = feat?.properties?.portIcon || "remove image";
            // console.log("---- new feature selected id | color | icon : ", draw.drawFeatureID, featureColor, featureIcon)
            document.getElementById("color-picker").value = featureColor;
            document.getElementById("color-picker").dispatchEvent(new Event('input', { bubbles: true }));
            document.getElementById('selected-icon').src = draw.options.icons?.find((i)=>i.name==featureIcon)?.url
            document.getElementById("pallete-container").classList.remove("hidden")
            // Coloris.setColorFromStr(featureColor);
            console.log("---- feat : ", feat)

            document.getElementById("icon-display").style.visibility=(feat?.geometry?.type == "Point")?"visible":"hidden";
            
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


      draw.options?.icons?.map((icon)=>{
        let imgel = document.createElement('img')
        imgel.className="icon-image";
        imgel.title=icon.name
        imgel.src=icon.url
        imgel.addEventListener("click",()=>changeIcon(draw, icon))
        document.getElementById('icon-selector').append(imgel)
      })

    },500)
  
    //--- initialize all icons ---
    draw.options?.icons?.forEach((icon)=>{
      icon.name!=="remove image"&&map.loadImage(icon.url, (error, image) => {
        if (error) throw error;
        console.log("----- icon : ", icon.name)
        image && map.addImage(icon.name, image);
      });
    })
  
  
  
  }
  