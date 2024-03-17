const customColorPickerStyles = [
    {
        'id': 'gl-draw-polygon-fill-color-picker',
        'type': 'fill',
        'filter': ['all', ['==', '$type', 'Polygon'],
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
        'filter': ['all', ['==', '$type', 'Polygon'],
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
        'filter': ['all', ['==', '$type', 'LineString'],
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
    // {
    //     'id': 'gl-draw-point-color-picker',
    //     'type': 'circle',
    //     'filter': ['all', ['==', '$type', 'Point'],
    //         ['has', 'user_portColor']
    //         ['!has', 'user_portIcon'],
    //     ],
    //     'paint': {
    //         'circle-radius': 5,
    //         'circle-color': ['get', 'user_portColor']
    //     }
    // },    
    {
        'id': "gl-draw-point-color-picker",
        'type': "symbol",
        'filter': ['all', ['==', '$type', 'Point'],
            ["==", "active", "false"],
            ['has', 'user_portIcon'],
        ],
        'layout': {
          'icon-image': ['get', 'user_portIcon'], //'custom-icon',
          'icon-size': 0.6,
          'icon-anchor': 'bottom',
        },
      },
  ];

  const customDrawStyles = (defaultStyle) => [...customColorPickerStyles, ...defaultStyle]
  export default customDrawStyles;