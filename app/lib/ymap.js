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
    this.districts = [];
    this.viewMode = 0; // 0 - default (serviceTypes), 1 - categories, 2 - districts

    this.ymap = YMapUtils.createMap(root, this.mapSettings, this.mapOptions);

    this.changeView = this.changeView.bind(this);
    this.filterPlacemarks = this.filterPlacemarks.bind(this);

    this.log('Map initialized', settings, options);
  }

  log(...args) {
    if (this.debug && typeof this.logger === 'function') this.logger(...args);
  }

  initManagers() {
    this.placemarkManager = YMapUtils.createObjectManager({
      clusterize: true,
      gridSize: 64,
      clusterIconLayout: 'default#pieChart',
    });
    this.polygonManager = YMapUtils.createObjectManager({
      gridSize: 64,
    });
    this.ymap.geoObjects.add(this.placemarkManager);
    this.ymap.geoObjects.add(this.polygonManager);
  }

  initFilters() {
    const serviceTypes = document.querySelectorAll('#serviceTypes .item');
    for (let i = 0; i < serviceTypes.length; i += 1) {
      ((index, filter) => {
        const el = serviceTypes[i];
        el.addEventListener('click', () => {
          filter((obj) => obj.options.categoryTypes.includes(index));
        });
      })(i, this.filterPlacemarks);
    }

    const districts = document.querySelectorAll('#districts .item');
    for (let i = 0; i < districts.length; i += 1) {
      ((index, filter, changeView) => {
        const el = districts[i];
        el.addEventListener('click', () => {
          console.log('filtering by districts');
          changeView(0);
          filter((obj) => obj.options.district === index);
        });
      })(i, this.filterPlacemarks, this.changeView);
    }
  }

  changeView(id) {
    if (this.debug) this.log('Changing view mode', id);
    if (id === 2) {
      this.filterPlacemarks(() => false);
      this.changePolygonVisibility(true);
    } else {
      this.filterPlacemarks(() => true);
      this.changePolygonVisibility(false);
    }
  }

  addPlacemarks(obj) {
    const data = JSON.parse(obj);
    if (this.debug) this.log('Adding map objects', data);
    data.features.map((feature) => {
      const edited = { ...feature };
      edited.options.iconColor = this.serviceTypes[feature.options.categoryTypes[0]].color;
      this.serviceTypes[feature.options.categoryTypes[0]].count += 1;
      return edited;
    });
    this.placemarkManager.add(data);
  }

  addPolygons(obj) {
    const data = JSON.parse(obj);
    this.polygonManager.add(data);
    this.polygonManager.objects.options.set({
      fillColor: '#166A99',
      strokeColor: '#ffffff',
      fillOpacity: 0.5,
      strokeOpacity: 0.5,
      strokeWidth: 2,
      strokeStyle: 'solid',
    });
    this.polygonManager.objects.events.add(['mouseenter', 'mouseleave'], (e) => {
      const objectId = e.get('objectId');
      if (e.get('type') === 'mouseenter') this.polygonManager.objects.setObjectOptions(objectId, { fillOpacity: 0.7 });
      else this.polygonManager.objects.setObjectOptions(objectId, { fillOpacity: 0.5 });
    });
    for (let i = 0; i < data.features.length; i += 1) {
      this.districts.push({ name: data.features[i].properties.hintContent });
    }
  }

  changePolygonVisibility(visible) {
    this.polygonManager.setFilter(() => visible);
  }

  filterPlacemarks(filter) {
    this.placemarkManager.setFilter(filter);
  }
}
