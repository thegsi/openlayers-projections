import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import XYZ from 'ol/source/XYZ.js';
import Overlay from 'ol/Overlay.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import {toStringHDMS} from 'ol/coordinate.js';

import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { GeoJSON } from 'ol/format';

import proj4 from 'proj4';
import {get as getProjection, transformExtent, fromLonLat, toLonLat} from 'ol/proj.js';
import {register} from 'ol/proj/proj4.js';

let displayExtent;
// Mollweide Equi-distant
const projCode = 'EPSG:54009'
const projDefs = '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 ' + '+units=m +no_defs'
displayExtent = [-18e6, -9e6, 18e6, 9e6]
// Behrmann Equal Area
// const projCode = 'ESRI:54017'
// const projDefs = '+proj=cea +lat_ts=30 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs'
// Albers Equal Area
// const projCode = 'EPSG:9822'
// const projDefs = '+proj=lcc +lat_0=42 +lon_0=3 +lat_1=41.25 +lat_2=42.75 +x_0=1700000 +y_0=1200000 +ellps=GRS80+towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs'
// displayExtent = [-10000000, -10000000, 10000000, 10000000]

proj4.defs(
  projCode,
  projDefs
);
register(proj4);
const displayProj = getProjection(projCode);

if (!Array.isArray(displayExtent)) {
  const worldExtent4326 = [-180, -90, 180, 90];
  displayExtent = transformExtent(worldExtent4326, 'EPSG:4326', displayProj);
}

// const layer = new TileLayer({
//   source: new OSM(),
// });
const layer = new TileLayer({
  source: new XYZ({
    url: 'https://cawm.lib.uiowa.edu/tiles/{z}/{x}/{y}.png',
  }),
});

const map = new Map({
  layers: [layer],
  target: 'map',
  view: new View({
    projection: displayProj,
    center: fromLonLat([0, 0]),
    zoom: 0,
    extent: displayExtent
    // center: [0, 0],
    // zoom: 2,
  }),
});

var popup = new Overlay({
    element: document.getElementById('popup'),
    autoPan: true,
    autoPanAnimation: {
        duration: 250
    }
});
map.addOverlay(popup);

// Load GeoJSON file
fetch('./data/BM_unaligned.json')
    .then(response => response.json())
    .then(data => {

        var features = new GeoJSON().readFeatures(data, {
            // featureProjection: 'EPSG:3857'
            featureProjection: projCode
        });
        var vectorSource = new VectorSource({
            features: features
        });
        // Create a vector layer to hold the markers
        var vectorLayer = new VectorLayer({
             source: vectorSource
        });
        map.addLayer(vectorLayer);

        const popup = new Overlay({
          element: document.getElementById('popup'),
          positioning: 'center-center'
        });
        map.addOverlay(popup);
        const closer = document.getElementById('popup-closer');

        const element = popup.getElement();

        map.on('click', function(event) {
            var feature = map.forEachFeatureAtPixel(event.pixel,
                  function(feature, layer) {
                      return feature;
                  });
            let popover = bootstrap.Popover.getInstance(element);
            if (popover) {
              popover.dispose();
            }

            if (feature) {
              // https://embed.plnkr.co/plunk/hhEAWk
              var geometry = feature.getGeometry();
              var coord = geometry.getCoordinates();
              popup.setPosition(coord);

              popover = new bootstrap.Popover(element, {
                animation: false,
                container: element,
                content: '<p>' + feature.get('checked_strings') + '</p>',
                html: true,
                title: feature.get('name'),
              });
              popover.show(event.coordinate);
            }
        });

        // closer.onclick = function() {
        //   overlay.setPosition(undefined);
        //   closer.blur();
        //   return false;
        // };
    });
