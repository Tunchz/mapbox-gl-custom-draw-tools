import MapboxDraw from "@mapbox/mapbox-gl-draw";
const theme = MapboxDraw.lib.theme;

const modifiedDefaultStyles = theme.map(defaultStyle => {
  if (defaultStyle.id === 'gl-draw-line-inactive') {
    return {
      ...defaultStyle,
      filter: [
        ...defaultStyle.filter,
        ['!=', 'user_isSnapGuide', 'true'],
      ],
    };
  }

  return defaultStyle;
});

const lineInactiveStyle = {
  "id": "gl-draw-line-inactive",
  "type": "line",
  "filter": [
      "all",
      [
          "==",
          "active",
          "false"
      ],
      [
          "==",
          "$type",
          "LineString"
      ],
      [
          "!=",
          "mode",
          "static"
      ],
      [
          "!=",
          "user_isSnapGuide",
          "true"
      ]
  ],
  "layout": {
      "line-cap": "round",
      "line-join": "round"
  },
  "paint": {
      "line-color": "#3bb2d0",
      "line-width": 2
  }
}

// console.log('--- modifiedDefaultStyles : ', modifiedDefaultStyles)
const customDrawStyles = [
  // ...modifiedDefaultStyles,
  lineInactiveStyle,
  {
    id: "guide",
    type: "line",
    filter: [
      "all",
      ["==", "$type", "LineString"],
      ["==", "user_isSnapGuide", "true"],
    ],
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "#000000",
      "line-width": 1,
      "line-dasharray": [2, 2],
    },
  },
];

export default customDrawStyles;



