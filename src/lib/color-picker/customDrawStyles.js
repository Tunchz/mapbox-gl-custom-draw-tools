const customColorPickerStyles = [
    {
        'id': 'gl-draw-polygon-fill-color-picker',
        'type': 'fill',
        'filter': [
            'all', 
            ['==', '$type', 'Polygon'],
            ["==", "active", "false"],
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
      },
    },
  ];

  const customDrawStyles = (defaultStyle) => [...customColorPickerStyles, ...defaultStyle]
  export default customDrawStyles;