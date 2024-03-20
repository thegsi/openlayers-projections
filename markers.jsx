import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import Overlay from 'ol/Overlay.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import {fromLonLat, toLonLat} from 'ol/proj.js';
import {toStringHDMS} from 'ol/coordinate.js';

import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { GeoJSON } from 'ol/format';

const layer = new TileLayer({
  source: new OSM(),
});

const map = new Map({
  layers: [layer],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
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
            featureProjection: 'EPSG:3857'
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
