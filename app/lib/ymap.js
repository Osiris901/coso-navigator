import YMapUtils from './ymapUtils';

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

export default class YMap {
  constructor({
    root, settings, options, logger, debug,
  }) {
    this.debug = debug;
    this.logger = logger;

    if (settings) {
      this.mapSettings = { ...settings };
    } else {
      this.mapSettings = { ...defaults.settings };
    }

    if (options) {
      this.mapOptions = { ...options };
    } else {
      this.mapOptions = { ...defaults.options };
    }

    this.ymap = new ymaps.Map(root, this.mapSettings, this.mapOptions);

    this.log('Map initialized', this.mapSettings, this.mapOptions);
  }

  log(...args) {
    if (this.debug && typeof this.logger === 'function') this.logger(...args);
  }

  addGeoObject(obj) {
    if (obj) this.ymap.geoObjects.add(obj);
    this.log('Added geoObject', obj);
  }

  generateDistrictMap(data) {
    const districts = YMapUtils.getDistrictsFromObj(data, false, {
      debug: this.debug, logger: this.logger,
    });

    for (let i = 0; i < districts.length; i += 1) {
      const polygon = YMapUtils.createPolygon({
        geocodes: districts[i].geocodes,
        name: districts[i].name,
        debug: this.debug,
        logger: this.logger,
      });

      this.addGeoObject(polygon);
    }

    if (this.debug) this.log('Generated district map');
  }

  // TODO: Рассмотреть использование objectManager для управления метками и кластерами
  generatePlacemarks(data) {
    // For testing
    const placemarkColors = [
      '#DB425A', '#4C4DA2', '#00DEAD', '#D73AD2',
      '#F8CC4D', '#F88D00', '#AC646C', '#548FB7',
    ];

    const placemarks = [];
    for (let i = 0; i < data.length; i += 1) {
      const pm = YMapUtils.createPlacemark({
        geocode: data[i].geocode,
        placemarkData: {
          header: data[i].name,
          content: data[i].contacts,
          footer: data[i].location,
          color: placemarkColors[Math.floor(Math.random() * placemarkColors.length)],
        },
        debug: this.debug,
        logger: this.logger,
      });
      placemarks.push(pm);
    }
    const clusterer = YMapUtils.createClusterer(placemarks);
    // CHECK: Нужно ли сохранять clusterer
    this.addGeoObject(clusterer);
  }
}
