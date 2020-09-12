import YMapUtils from './ymapUtils';

export default class YMap {
  constructor({
    root, settings, options, serviceTypes, logger, debug,
  }) {
    this.debug = debug;
    this.logger = logger;

    this.mapSettings = { ...settings };
    this.mapOptions = { ...options };

    this.serviceTypes = serviceTypes;

    this.ymap = YMapUtils.createMap(root, this.mapSettings, this.mapOptions);;

    this.log('Map initialized', settings, options);
  }

  log(...args) {
    if (this.debug && typeof this.logger === 'function') this.logger(...args);
  }

  initManagers() {
    this.placemarkManager = YMapUtils.createObjectManager({
      clusterize: true,
      // ObjectManager принимает те же опции, что и кластеризатор.
      gridSize: 64,
      // Макет метки кластера pieChart.
      clusterIconLayout: 'default#pieChart',
    });
    this.polygonManager = YMapUtils.createObjectManager({
      gridSize: 64,
    });
    this.ymap.geoObjects.add(this.placemarkManager);
    this.ymap.geoObjects.add(this.polygonManager);
  }

  addPlacemarks(data) {
    // if (this.debug) this.log('Adding map objects', obj);
    this.placemarkManager.add(data);
  }

  addPolygons(data) {
    this.polygonManager.add(data);
  }
}
