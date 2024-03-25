// import { highlightPropertyName as _highlightPropertyName } from "../mapbox-gl-draw-select-mode/constants";

// const highlightPropertyName = `user_${_highlightPropertyName}`;

const customColorPickerStyles = [
    {
        'id': 'gl-draw-polygon-fill-color-picker',
        'type': 'fill',
        'filter': [
            'all', 
            ['==', '$type', 'Polygon'],
            ["==", "active", "false"],
            // ["!has", highlightPropertyName],
            ['has', 'user_portColor']
        ],
        'paint': {
            'fill-color': ['get', 'user_portColor'],
            'fill-outline-color': ['get', 'user_portColor'],
            'fill-opacity': 0.2
        }
    },
    {
        'id': 'gl-draw-polygon-stroke-color-picker',
        'type': 'line',
        'filter': [
            'all', 
            ['==', '$type', 'Polygon'],
            ["==", "active", "false"],
            // ["!has", highlightPropertyName],
            ['has', 'user_portColor']
        ],
        "layout": {
          "line-cap": "round",
          "line-join": "round",
        },
        "paint": {
          "line-color": ['get', 'user_portColor'],
          "line-width": 4,
        },
    },
    {
        'id': 'gl-draw-line-color-picker',
        'type': 'line',
        'filter': [
            'all', 
            ['==', '$type', 'LineString'],
            ["==", "active", "false"],
            // ["!has", highlightPropertyName],
            ['has', 'user_portColor']
        ],
        "layout": {
          "line-cap": "round",
          "line-join": "round",
        },
        'paint': {
            'line-color': ['get', 'user_portColor'],
            'line-width': 4
        }
    },
    {
      id: "gl-draw-point-stroke-inactive-color-picker",
      type: "circle",
      filter: [
        "all",
        ["==", "$type", "Point"],
        ["==", "active", "true"],
        ["!=", "meta", "midpoint"],
        ['has', 'user_portColor'],
      ],
      paint: {
        "circle-radius": 7,
        "circle-color": ['get', 'user_portColor'],
      },
    },
    {
      id: "gl-draw-line-active-color-picker",
      type: "line",
      filter: [
          "all", 
          ["==", "$type", "LineString"], 
          ["==", "active", "true"],
          ['has', 'user_portColor'],
      ],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": ['get', 'user_portColor'],
        "line-dasharray": [0.2, 2],
        "line-width": 2,
      },
    },
    {
      id: "gl-draw-polygon-fill-active-color-picker",
      type: "fill",
      filter: [
        "all", 
        ["==", "active", "true"], 
        ["==", "$type", "Polygon"],
        ['has', 'user_portColor'],
      ],
      paint: {
        "fill-color": ['get', 'user_portColor'],
        "fill-outline-color": ['get', 'user_portColor'],
        "fill-opacity": 0.1,
      },
    },
    {
      id: "gl-draw-polygon-stroke-active-color-picker",
      type: "line",
      filter: [
          "all", 
          ["==", "active", "true"], 
          ["==", "$type", "Polygon"],
          ['has', 'user_portColor'],
      ],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": ['get', 'user_portColor'],
        "line-dasharray": [0, 2],
        "line-width": 2,
      },
    },
    {
        'id': 'gl-draw-point-color-picker',
        'type': 'circle',
        'filter': ['all', ['==', '$type', 'Point'],
            ["==", "active", "false"],
            ['has', 'user_portColor'],
            ['!has', 'user_portIcon'],
            ["!=", "mode", "pinning_mode"],
        ],
        'paint': {
            'circle-radius': 5,
            'circle-color': ['get', 'user_portColor']
        }
    },    
    {
      'id': "gl-draw-point-marker-color-picker",
      'type': "symbol",
      'filter': [
          'all', 
          ['==', '$type', 'Point'],
          // ["==", "active", "false"],
          ['has', 'user_portIcon'],
      ],
      'layout': {
        'icon-image': ['get', 'user_portIcon'], //'custom-icon',
        'icon-size': ['get', 'user_portIconSize'],
        'icon-anchor': 'bottom',
        // "text-field": ['get', 'user_portText'],
        // "text-font": ['Open Sans Extrabold', 'Arial Unicode MS Bold'],
        // // 'text-ignore-placement': true,
        // 'text-anchor': 'top',
        // 'text-offset': [0, 10],
        // "text-size": 12,
      },
      // 'paint': {
      //     "text-color": ['get', 'user_portColor'],
      //     "text-halo-color": '#fff',
      //     "text-halo-width": 0.5,
      //     "text-halo-blur": 0,
      //     'text-opacity':1
      // }
    },
    {
      'id': "gl-draw-point-text-marker-color-picker",
      'type': "symbol",
      'filter': [
          'all', 
          ['==', '$type', 'Point'],
          // ["==", "active", "false"],
          ['has', 'user_portText'],
      ],
      "layout": {
          "text-field": ['get', 'user_portText'],
          "text-font": ['Open Sans Extrabold', 'Arial Unicode MS Bold'],
          // 'text-ignore-placement': true,
          'text-anchor': 'top',
          'text-offset': [0, 10],
          "text-size": 12,
          // 'symbol-placement': "point"
      },
      "paint": {
          "text-color": ['get', 'user_portColor'],
          "text-halo-color": '#fff',
          "text-halo-width": 0.5,
          "text-halo-blur": 0,
          'text-opacity':1
      }
    }
  ];

  const customDrawStyles = (defaultStyle) => [...customColorPickerStyles, ...defaultStyle]
  export default customDrawStyles;