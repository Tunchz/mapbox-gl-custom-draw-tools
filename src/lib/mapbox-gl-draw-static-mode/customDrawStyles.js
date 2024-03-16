const staticStyles = [
    {
      id: "gl-draw-polygon-fill-static",
      type: "fill",
      filter: ["all", ["==", "mode", "static"], ["==", "$type", "Polygon"]],
      paint: {
        "fill-color": "#FF0000",
        "fill-outline-color": "#FF0000",
        "fill-opacity": 0.1,
      },
    },
    {
      id: "gl-draw-polygon-stroke-static",
      type: "line",
      filter: ["all", ["==", "mode", "static"], ["==", "$type", "Polygon"]],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#FF0000",
        "line-width": 3,
      },
    },
    {
      id: "gl-draw-line-static",
      type: "line",
      filter: ["all", ["==", "mode", "static"], ["==", "$type", "LineString"]],
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#FF0000",
        "line-width": 5,
      },
    },
    {
      id: "gl-draw-point-static",
      type: "circle",
      filter: ["all", ["==", "mode", "static"], ["==", "$type", "Point"]],
      paint: {
        "circle-radius": 5,
        "circle-color": "#FF0000",
      },
    },
  ];

  const customDrawStyles = (defaultStyle) => [...staticStyles, ...defaultStyle]
  export default customDrawStyles;