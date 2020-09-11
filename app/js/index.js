import regeneratorRuntime from 'regenerator-runtime';
import YMap from '../lib/ymap';
import districts from '../localStorage/districtCollection';
import providers from '../localStorage/providerCollection';

ymaps.ready(init);

async function init() {
  const map = new YMap({ root: 'app', debug: true, logger: console.log });
  map.generateDistrictMap(districts());
  map.generatePlacemarks(providers());
}
