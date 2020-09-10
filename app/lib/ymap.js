import regeneratorRuntime from 'regenerator-runtime';

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

  // TODO: Проверить правильность использования async
  // TODO: https://github.com/babel/babel/issues/9849#issuecomment-487040428
  async geocodeFromLocation(location) {
    let geocode = null;
    this.log('Trying to find geocode', location);

    const geocoder = ymaps.geocode(location, { json: true, results: 10 });

    const res = await geocoder;
    [geocode] = res.GeoObjectCollection.featureMember;

    this.log('Found geocode', geocode, res);

    return geocode;
  }

  log(...args) {
    if (this.debug) {
      this.logger(...args);
    }
  }

  addGeoObject(obj) {
    this.ymap.geoObjects.add(obj);
    this.log('Adding new geoObject', obj);
  }

  /* createYmapPoint({ name, coord, contacts }) {
    const geoPoint = YMap.createGeoPoint(coord);

    return {
      ...geoPoint,
      meta
    };
  } */

  generateDistrictsFromObject(obj) {
    const districts = YMap.getDistricts(obj);
    for (let i = 0; i < districts.length; i += 1) {
      const polygon = YMap.createGeoPolygon(districts[i].polygons, districts[i].name);
      this.addGeoObject(polygon);
    }
  }

  // TODO: Вынести все статичные функции в класс MapUtils
  static getDistricts(data) {
    console.log('Scanning districts db', data);
    const districts = [];
    for (let i = 0; i < data.length; i += 1) {
      const c = data[i].territory.map((value) => [parseFloat(value.lat), parseFloat(value.lng)]);
      districts.push({ name: data[i].district, polygons: c });
    }
    console.log('Parsed districts', districts);
    return districts;
  }

  static createGeoPoint(coord) {
    console.log('Generating new geoPoint', coord);
    return new ymaps.GeoObject({
      geometry: {
        type: 'Point',
        coordinates: coord,
      },
    });
  }

  static createGeoPolygon(coords, name) {
    console.log('Generating new geoPolygon', coords, name);

    return new ymaps.Polygon([[...coords]],
      {
        hintContent: name,
      }, {
        fillColor: '#166A99',
        strokeColor: '#ffffff',
        fillOpacity: 0.5,
        strokeOpacity: 0.5,
        strokeWidth: 2,
        strokeStyle: 'solid',
      });
  }
}
