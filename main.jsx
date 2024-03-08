import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';
import proj4 from 'proj4';
import XYZ from 'ol/source/XYZ.js';

// import TileGrid from 'ol/tilegrid/TileGrid.js';
// import WMTS, {optionsFromCapabilities} from 'ol/source/WMTS.js';
// import WMTSCapabilities from 'ol/format/WMTSCapabilities.js';
// import {OSM, TileImage, TileWMS} from 'ol/source.js';
// import {createXYZ} from 'ol/tilegrid.js';
// import {getCenter, getWidth} from 'ol/extent.js';
import {get as getProjection, transformExtent, fromLonLat} from 'ol/proj.js';
import {register} from 'ol/proj/proj4.js';

let displayExtent;
// Mollweide Equi-distant
// const projCode = 'EPSG:54009'
// const projDefs = '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 ' + '+units=m +no_defs'
// displayExtent = [-18e6, -9e6, 18e6, 9e6]
// Behrmann Equal Area
// const projCode = 'ESRI:54017'
// const projDefs = '+proj=cea +lat_ts=30 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs'
// Albers Equal Area
const projCode = 'EPSG:9822'
const projDefs = '+proj=lcc +lat_0=42 +lon_0=3 +lat_1=41.25 +lat_2=42.75 +x_0=1700000 +y_0=1200000 +ellps=GRS80+towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs'
displayExtent = [-10000000, -10000000, 10000000, 10000000]

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

const map = new Map({
  // layers: [
  //   new TileLayer({
  //     source: new OSM(),
  //   }),
  // ],
  layers: [
    new TileLayer({
      source: new XYZ({
        url:
          'https://cawm.lib.uiowa.edu/tiles/{z}/{x}/{y}.png',
      }),
    }),
  ],
  target: 'map',

  view: new View({
    projection: displayProj,
    center: fromLonLat([0, 0]),
    zoom: 0,
    extent: displayExtent
  })
});
