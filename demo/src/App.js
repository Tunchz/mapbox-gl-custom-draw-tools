import React, { useRef, useEffect } from 'react';
import mapboxGl from 'mapbox-gl';

import MapboxDrawPro from 'mapbox-gl-custom-draw-tools';

import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import './App.css';

let map;
let draw;

function App() {
  if (mapboxGl.getRTLTextPluginStatus() === 'unavailable')
    mapboxGl.setRTLTextPlugin(
      'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
      (err) => {
        err && console.error(err);
      },
      true
    );
  let mapRef = useRef(null);

  useEffect(() => {
    map = new mapboxGl.Map({
      container: mapRef.current || '',
      style: `https://map.ir/vector/styles/main/mapir-xyz-light-style.json`,
      center: [51.3857, 35.6102],
      zoom: 10,
      pitch: 0,
      interactive: true,
      hash: true,
      attributionControl: true,
      customAttribution: '© Map © Openstreetmap',
      transformRequest: (url) => {
        return {
          url: url,
          headers: {
            'x-api-key':
              'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImRiZWU0YWU4OTk4OTA3MmQ3OTFmMjQ4ZDE5N2VhZTgwZWU2NTUyYjhlYjczOWI2NDdlY2YyYzIzNWRiYThiMzIzOTM5MDkzZDM0NTY2MmU3In0.eyJhdWQiOiI5NDMyIiwianRpIjoiZGJlZTRhZTg5OTg5MDcyZDc5MWYyNDhkMTk3ZWFlODBlZTY1NTJiOGViNzM5YjY0N2VjZjJjMjM1ZGJhOGIzMjM5MzkwOTNkMzQ1NjYyZTciLCJpYXQiOjE1OTA4MjU0NzIsIm5iZiI6MTU5MDgyNTQ3MiwiZXhwIjoxNTkzNDE3NDcyLCJzdWIiOiIiLCJzY29wZXMiOlsiYmFzaWMiXX0.M_z4xJlJRuYrh8RFe9UrW89Y_XBzpPth4yk3hlT-goBm8o3x8DGCrSqgskFfmJTUD2wC2qSoVZzQKB67sm-swtD5fkxZO7C0lBCMAU92IYZwCdYehIOtZbP5L1Lfg3C6pxd0r7gQOdzcAZj9TStnKBQPK3jSvzkiHIQhb6I0sViOS_8JceSNs9ZlVelQ3gs77xM2ksWDM6vmqIndzsS-5hUd-9qdRDTLHnhdbS4_UBwNDza47Iqd5vZkBgmQ_oDZ7dVyBuMHiQFg28V6zhtsf3fijP0UhePCj4GM89g3tzYBOmuapVBobbX395FWpnNC3bYg7zDaVHcllSUYDjGc1A', //dev api key
            'Mapir-SDK': 'reactjs',
          },
        };
      },
    });

    draw = new MapboxDrawPro({otherOtions:{horizontal:true,edge:'bottom'}});
    window.draw = draw;

    map.once('load', () => {
      map.resize();
      map.addControl(draw, 'bottom-right');
      draw.set({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            id: 'example-polygon-id',
            geometry: {
              type: 'Polygon',
              coordinates: [
                [
                  [51.41742415918904, 35.73019558439101],
                  [51.31319413385742, 35.702773908694724],
                  [51.378997493472525, 35.665562843119986],
                  [51.45008537540798, 35.67776544979942],
                  [51.46619566741822, 35.70822028156377],
                  [51.41742415918904, 35.73019558439101],
                ],
              ],
            },
          },     
          {
            id: 'example_line_id',
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [51.46717071533203, 35.752642192392955],
                [51.41704559326172, 35.7715862712587],
                [51.37207031249999, 35.73954585450408],
                [51.31988525390625, 35.753756674845675],
                [51.29344940185547, 35.713904233681035],
                [51.37035369873047, 35.67012719291238],
                [51.32434844970703, 35.633581468816594],
              ],
            },
          },
        ],
      });
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
      // map.on('draw.update', function (e) {
      //   console.log("----- on draw.update : ", e);
      // });
      // map.on('draw.update', function (e) {
      //   console.log("----- on draw.update : ", e);
      // });

    });
  }, []);

  return (
    <div className="map-wrapper">
      <div id="map" ref={mapRef} />
    </div>
  );
}

export default App;
