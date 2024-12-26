import React, { useRef, useEffect } from 'react';
import mapboxGl from 'mapbox-gl';

import MapboxDrawPro from 'mapbox-gl-custom-draw-tools';
// import { icons } from './icons';

import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import './App.css';

import icons2 from './icons2'
import country_flags from './country';
import loadLayers from './addLayers';

let map;
let draw;

function App() {
//   if (mapboxGl.getRTLTextPluginStatus() === 'unavailable')
//     mapboxGl.setRTLTextPlugin(
//       'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
//       (err) => {
//         err && console.error(err);
//       },
//       true
//     );
  let mapRef = useRef(null);
  mapboxGl.accessToken ='pk.eyJ1IjoibWljaGFuYWoiLCJhIjoiY2o5bWZncDZpNG5lODJxbGc4MGM2ZTlkbiJ9.104KDhbdAiUdrAuAxj05Sw';
  useEffect(() => {
    map = new mapboxGl.Map({

        // accessToken:"pk.eyJ1IjoibWljaGFuYWoiLCJhIjoiY2o5bWZncDZpNG5lODJxbGc4MGM2ZTlkbiJ9.104KDhbdAiUdrAuAxj05Sw",

      container: mapRef.current || '',
      style: `mapbox://styles/mapbox/light-v10`,
      center: [51.3857, 35.6102],
      zoom: 10,
      pitch: 0,
      interactive: true,
      hash: true,
      attributionControl: true,
    //   customAttribution: '© Map © Openstreetmap',
    //   transformRequest: (url) => {
    //     return {
    //       url: url,
    //       headers: {
    //         'x-api-key':
    //         // 'pk.eyJ1IjoibWljaGFuYWoiLCJhIjoiY2o5bWZncDZpNG5lODJxbGc4MGM2ZTlkbiJ9.104KDhbdAiUdrAuAxj05Sw',
    //           'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImRiZWU0YWU4OTk4OTA3MmQ3OTFmMjQ4ZDE5N2VhZTgwZWU2NTUyYjhlYjczOWI2NDdlY2YyYzIzNWRiYThiMzIzOTM5MDkzZDM0NTY2MmU3In0.eyJhdWQiOiI5NDMyIiwianRpIjoiZGJlZTRhZTg5OTg5MDcyZDc5MWYyNDhkMTk3ZWFlODBlZTY1NTJiOGViNzM5YjY0N2VjZjJjMjM1ZGJhOGIzMjM5MzkwOTNkMzQ1NjYyZTciLCJpYXQiOjE1OTA4MjU0NzIsIm5iZiI6MTU5MDgyNTQ3MiwiZXhwIjoxNTkzNDE3NDcyLCJzdWIiOiIiLCJzY29wZXMiOlsiYmFzaWMiXX0.M_z4xJlJRuYrh8RFe9UrW89Y_XBzpPth4yk3hlT-goBm8o3x8DGCrSqgskFfmJTUD2wC2qSoVZzQKB67sm-swtD5fkxZO7C0lBCMAU92IYZwCdYehIOtZbP5L1Lfg3C6pxd0r7gQOdzcAZj9TStnKBQPK3jSvzkiHIQhb6I0sViOS_8JceSNs9ZlVelQ3gs77xM2ksWDM6vmqIndzsS-5hUd-9qdRDTLHnhdbS4_UBwNDza47Iqd5vZkBgmQ_oDZ7dVyBuMHiQFg28V6zhtsf3fijP0UhePCj4GM89g3tzYBOmuapVBobbX395FWpnNC3bYg7zDaVHcllSUYDjGc1A', //dev api key
    //         'Mapir-SDK': 'reactjs',
    //       },
    //     };
    //   },
    });

    // console.log("---- icons : ", icons)

    draw = new MapboxDrawPro({
      controls: {
        // line: false,
        
        // additional_tools: false,
        // centroid: false

        // snap_tools: false,
        // snap: false,

        // file_tools: false,
        // import: false,
      },
    //   persistModeOnClick:true,
      colorPalleteAlwaysOn: true,
      icons:icons2.concat(country_flags),
      iconGroups:["military","flags"],
      defaultSelectedGroup:"military",
      disableDefaultIcons: false,
      otherOptions:{
        horizontal:true,
        edge:'bottom', 
        paint:{
            // simplify:true, 
            mode:1
        },
        circle:{
            // simplify:true, 
            mode:2
        },
        ellipse:{
            // simplify:true, 
            mode:2
        },

        rectangleDefaultLimit: 100,
        
        bufferSize: 0.5,
        bufferUnit: 'kilometers',
        bufferSteps: 64,
        showLength: true,
        lengthUnits: 'kilometers',
        showArea: true,

        snap: false,
        snapOptions: {
            snapPx: 15,
            snapToMidPoints: true,
            snapVertexPriorityDistance: false,
        },
        guides: false,
        userProperties: true,
    }
    });
    window.draw = draw;

    map.once('load', () => {
      map.resize();
      map.addControl(draw, 'bottom-right');
      draw.set({
        "type": "FeatureCollection",
        "features": [
            {
                "id": "example-polygon-id",
                "type": "Feature",
                "properties": {
                    "portColor": "#d62828"
                },
                "geometry": {
                    "coordinates": [
                        [
                            [
                                51.47360682780132,
                                35.72115377930474
                            ],
                            [
                                51.3693768024697,
                                35.693732103608454
                            ],
                            [
                                51.435180162084805,
                                35.656521038033716
                            ],
                            [
                                51.50626804402026,
                                35.668723644713154
                            ],
                            [
                                51.5223783360305,
                                35.6991784764775
                            ],
                            [
                                51.47360682780132,
                                35.72115377930474
                            ]
                        ]
                    ],
                    "type": "Polygon"
                }
            },
            {
                "id": "example_line_id",
                "type": "Feature",
                "properties": {
                    "portColor": "#2a9d8f"
                },
                "geometry": {
                    "coordinates": [
                        [
                            51.46717071533203,
                            35.752642192392955
                        ],
                        [
                            51.41704559326172,
                            35.7715862712587
                        ],
                        [
                            51.37207031249999,
                            35.73954585450408
                        ],
                        [
                            51.31988525390625,
                            35.753756674845675
                        ],
                        [
                            51.29344940185547,
                            35.713904233681035
                        ],
                        [
                            51.37035369873047,
                            35.67012719291238
                        ],
                        [
                            51.32434844970703,
                            35.633581468816594
                        ]
                    ],
                    "type": "LineString"
                }
            },
            {
                "id": "de17d7fc0c82f9c532ad6d19ea1070d4",
                "type": "Feature",
                "properties": {
                    "portColor": "#f4a261"
                },
                "geometry": {
                    "coordinates": [
                        51.41057803915106,
                        35.61073780735758
                    ],
                    "type": "Point"
                }
            },
            {
                "id": "efeb5f9bd1e72b70724a25b6d543c679",
                "type": "Feature",
                "properties": {
                    "portColor": "#2a9d8f",
                    "portIcon": "ccinfo",
                    "portIconSize": 0.5
                },
                "geometry": {
                    "coordinates": [
                        51.24739621222494,
                        35.60690597419163
                    ],
                    "type": "Point"
                }
            },
            {
                "id": "933189cb4af70fb5e29d703394c93639",
                "type": "Feature",
                "properties": {
                    "portColor": "#f4a261",
                    "portIcon": "ccinfo",
                    "portIconSize": 0.5
                },
                "geometry": {
                    "coordinates": [
                        51.36811361786684,
                        35.60288816217536
                    ],
                    "type": "Point"
                }
            },
            {
                "id": "72cfbe1f6f04c9666ca45b67afc24e05",
                "type": "Feature",
                "properties": {
                    "portColor": "#00b4d8",
                    "portIcon": "ccinfo",
                    "portIconSize": 0.5
                },
                "geometry": {
                    "coordinates": [
                        51.45918113440365,
                        35.589685359464156
                    ],
                    "type": "Point"
                }
            },
            {
                "id": "197fefe6d133e2a3ea9ec1bcd5930882",
                "type": "Feature",
                "properties": {
                    "portColor": "#2a9d8f",
                    "portIcon": "ccinfo",
                    "portIconSize": 0.5,
                    "portText": "Weerapong Tuncharoen",
                },
                "geometry": {
                    "coordinates": [
                        51.59825323330014,
                        35.619532069899975
                    ],
                    "type": "Point"
                }
            },
            {
                "id": "1d0dd9484a9c15d5b46548802352c228",
                "type": "Feature",
                "properties": {
                    "portColor": "#f4a261",
                    "portIcon": "ccinfo",
                    "portIconSize": 0.5,
                    "portText": "วีระพงค์ ตั้นเจริญ",
                },
                "geometry": {
                    "coordinates": [
                        51.57213309289864,
                        35.678045194059834
                    ],
                    "type": "Point"
                }
            }
        ]

    });

    loadLayers(map);

      // draw.set({
      //   type: 'FeatureCollection',
      //   features: [
      //     {
      //       type: 'Feature',
      //       properties: {},
      //       id: 'example-polygon-id',
      //       geometry: {
      //         type: 'Polygon',
      //         coordinates: [
      //           [
      //             [51.41742415918904, 35.73019558439101],
      //             [51.31319413385742, 35.702773908694724],
      //             [51.378997493472525, 35.665562843119986],
      //             [51.45008537540798, 35.67776544979942],
      //             [51.46619566741822, 35.70822028156377],
      //             [51.41742415918904, 35.73019558439101],
      //           ],
      //         ],
      //       },
      //     },     
      //     {
      //       id: 'example_line_id',
      //       type: 'Feature',
      //       properties: {},
      //       geometry: {
      //         type: 'LineString',
      //         coordinates: [
      //           [51.46717071533203, 35.752642192392955],
      //           [51.41704559326172, 35.7715862712587],
      //           [51.37207031249999, 35.73954585450408],
      //           [51.31988525390625, 35.753756674845675],
      //           [51.29344940185547, 35.713904233681035],
      //           [51.37035369873047, 35.67012719291238],
      //           [51.32434844970703, 35.633581468816594],
      //         ],
      //       },
      //     },
      //   ],
      // });
      map.on('draw.create', function (e) {
        console.log("----- on draw.create : ", e);
      });
      map.on('draw.update', function (e) {
        console.log("----- on draw.update : ", e);
      });
      // map.on('draw.render', function (e) {
      //   console.log("----- on draw.render : ", e);
      // });
      map.on('draw.delete', function (e) {
        console.log("----- on draw.delete : ", e);
      });
      map.on('draw.selectionchange', function (e) {
        console.log("----- on draw.selectionchange : ", e);
      });
      map.on('draw.modechange', function (e) {
        console.log("----- on draw.modechange : ", e);
      });
      // map.on('draw.actionable', function (e) {
      //   console.log("----- on draw.actionable : ", e);
      // });
      map.on('draw.combine', function (e) {
        console.log("----- on draw.combine : ", e);
      });
      map.on('draw.uncombine', function (e) {
        console.log("----- on draw.uncombine : ", e);
      });
      map.on('draw.update', function (e) {
        console.log("----- on draw.update : ", e);
      });
      // map.on('draw.update', function (e) {
      //   console.log("----- on draw.update : ", e);
      // });
      map.on('draw.activebutton', function (e) {
        console.log("----- on draw.activebutton : ", e?.id);
      });


    });
  }, []);

  return (
    <div className="map-wrapper">
      <div id="map" ref={mapRef} />
    </div>
  );
}

export default App;
