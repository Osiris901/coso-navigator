// import docx4js from 'docx4js';
import YMap from '../lib/ymap';
import getPlacemarks from '../localStorage/placemarkCollection';
import getPolygons from '../localStorage/polygonCollection';

const defaults = {
  settings: {
    center: [59.94, 30.31],
    zoom: 10,
    controls: ['geolocationControl', 'typeSelector', 'fullscreenControl', 'zoomControl'],
  },
  options: {
    geolocationControlFloat: 'right',
    zoomControlFloat: 'none',
    zoomControlPosition: {
      bottom: '40px',
      right: '30px',
    },
  },
};

const categories = [
  { name: 'Граждане пожилого возраста', color: '#ED4543', serviceTypes: new Set() },
  { name: 'Многодетные семьи', color: 'purple', serviceTypes: new Set() },
];

const serviceTypes = [
  { name: 'Уход на дому', color: '#1E98FF', count: 0 },
  { name: 'Экстренная помощь «тревожная кнопка»', color: '#ED4543', count: 0 },
  { name: 'Финансовая помощь', color: '#0E4779', count: 0 },
];

// eslint-disable-next-line no-undef
ymaps.ready({
  successCallback: () => {
    const map = new YMap({
      root: 'map-div',
      settings: defaults.settings,
      options: defaults.options,
      categories,
      serviceTypes,
      debug: true,
      logger: console.log,
    });
    map.addPolygons(JSON.parse(getPolygons()));
    map.addPlacemarks(JSON.parse(getPlacemarks()));
    map.setMode();

    // const input = document.querySelector('#field');
    // input.onchange = () => test(input);
  },
  errorCallback: (context) => {
    console.log(context);
  },
});

/* function test(input) {
  console.log('Running lib');
  docx4js.load(input.files[0]).then((docx) => {
    input.value = '';
    const content = [];
    const allowedTags = ['tc', 'tr', 't'];
    docx.render((type, children, data) =>
      (allowedTags.includes(type) ? content.push({ type, data }) : null));
    const result = renderer(content);
    const csvContent = `data:text/csv;charset=utf-8,${
      result.map((e) => e.map((i) => `"${i}"`).join(',')).join('\n')}`;
    // let encodedUri = encodeURI(csvContent);
    // window.open(encodedUri);
    const counter = -1;
    const prom = new Promise((resolve) => {
      const featureCollection = {
        type: 'FeatureCollection',
        features: [],
      };
      for (let i = 0; i < result.length; i += 1) {
        YMapUtils.geocodeFromLocation(result[i][1]).then((res) => {
          const elem = {
            type: 'Feature',
            id: i,
            geometry: {
              type: 'Point',
              coordinates: res.GeoObject.Point.pos.split(' ').reverse().map((e) => (parseFloat(e))),
            },
            properties: {
              balloonHeader: result[i][0],
              balloonContent: result[i][1],
              balloonFooter: result[i][2],
            },
            options: {
              preset: 'islands#circleIcon',
              category: 0,
              serviceType: 0,
              district: 0,
            },
          };
          document.querySelector('.parsed').textContent += (JSON.stringify(elem) + ',');
          console.log(elem);
          featureCollection.features.push(elem);
        });
      }
      console.log(featureCollection);
      resolve(featureCollection);
    }).then((res) => {
      setTimeout(document.querySelector('.parsed').textContent = JSON.stringify(res), 10000);
    });
  });
}

function renderer(data) {
  let tableNotFound = true;
  let cellContent = [];
  let cellsContent = [];
  const rowContent = [];

  for (let i = 0; i < data.length; i += 1) {
    if (tableNotFound) {
      if (data[i].type == 'tr') tableNotFound = false;
    } else if (data[i].type == 'tr') {
      rowContent.push(cellsContent);
      cellsContent = [];
    } else if (data[i].type == 'tc') {
      cellsContent.push(cellContent.join(' ').trim());
      cellContent = [];
    } else if (data[i].data) cellContent.push(data[i].data);
  }

  if (tableNotFound) {
    console.log("Can't find table!");
    return;
  }

  console.log(rowContent);
  return rowContent;
} */
