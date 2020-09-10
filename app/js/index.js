import regeneratorRuntime from 'regenerator-runtime';
import YMap from '../lib/ymap';
import districts from '../districts';

const exampleData = {
  providers: [
    {
      name: 'Общество с ограниченной ответственностью «Гармония»',
      location: '195112, г Санкт-Петербург, пр-кт. Новочеркасский, д. 33, корп. 3, Литер А',
      contacts: '702-04-90, факс 702-04-91 https://www.garmonia-group.ru/sidelki',
    },
  ],
};

ymaps.ready(init);

async function init() {
  const map = new YMap({ root: 'app', debug: true, logger: console.log });
  const testGeocode = await map.geocodeFromLocation(exampleData.providers[0].location);
  const point = YMap.createGeoPoint(testGeocode.GeoObject.Point.pos.split(' ').reverse());
  map.addGeoObject(point);

  const districtsData = districts();
  map.generateDistrictsFromObject(districtsData);
}
