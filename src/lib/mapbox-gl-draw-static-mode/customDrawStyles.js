const staticStyles = [
    {
      id: "gl-draw-polygon-fill-static",
      type: "fill",
      filter: [
        "all", 
        ["==", "mode", "static"], 
        ["==", "$type", "Polygon"],
        ['!has', 'user_portColor'],
      ],
      paint: {
        "fill-color": "#FF0000",
        "fill-outline-color": "#FF0000",
        "fill-opacity": 0.1,
      },
    },
    {
      id: "gl-draw-polygon-stroke-static",
      type: "line",
      filter: [
        "all", 
        ["==", "mode", "static"], 
        ["==", "$type", "Polygon"],
        ['!has', 'user_portColor'],
      ],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#FF0000",
        "line-width": 4,
      },
    },
    {
      id: "gl-draw-line-static",
      type: "line",
      filter: [
        "all", 
        ["==", "mode", "static"], 
        ["==", "$type", "LineString"],
        ['!has', 'user_portColor'],
      ],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#FF0000",
        "line-width": 4,
      },
    },
    {
      id: "gl-draw-point-static",
      type: "circle",
      filter: [
        "all", 
        ["==", "mode", "static"], 
        ["==", "$type", "Point"],
        ['!has', 'user_portColor'],
        ['!has', 'user_portIcon'],
      ],
      paint: {
        "circle-radius": 5,
        "circle-color": "#FF0000",
      },
    },
  ];

  const customDrawStyles = (defaultStyle) => [...staticStyles, ...defaultStyle]
  export default customDrawStyles;