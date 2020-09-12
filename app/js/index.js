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

// eslint-disable-next-line no-undef
ymaps.ready({
  successCallback: () => {
    const map = new YMap({
      root: 'map-div', settings: defaults.settings, options: defaults.options, debug: true, logger: console.log,
    });
    map.initManagers();
    map.addPlacemarks(getPlacemarks());
    map.addPolygons(getPolygons());
  },
  errorCallback: (context) => {
    console.log(context);
  },
});
