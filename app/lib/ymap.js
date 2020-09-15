import YMapUtils from './ymapUtils';

export default class YMap {
  constructor({
    root,
    settings,
    options,
    categories,
    serviceTypes,
    logger,
    debug,
  }) {
    this.debug = debug;
    this.logger = logger;

    this.settings = { ...settings };
    this.options = { ...options };

    this.categories = categories;
    this.serviceTypes = serviceTypes;
    this.districts = [];

    this.mode = 0; // 0 - default, 1 - { * . . }, 2 - { * * . }, 3 { * * * }
    this.state = {
      category: 0,
      type: 0,
      district: 0,
    };

    this.ymap = YMapUtils.createMap(root, this.settings, this.options);
    this.placemarkManager = YMapUtils.createObjectManager({
      clusterize: true,
      clusterIconLayout: 'default#pieChart',
    });
    this.polygonManager = YMapUtils.createObjectManager();
    this.ymap.geoObjects.add(this.placemarkManager);
    this.ymap.geoObjects.add(this.polygonManager);

    this.highlight = this.highlight.bind(this);
    this.focusPlacemark = this.focusPlacemark.bind(this);
    this.addPolygons = this.addPolygons.bind(this);
    this.addPlacemarks = this.addPlacemarks.bind(this);
    this.setMode = this.setMode.bind(this);

    this.controls = document.querySelector('#filters').children;
    this.results = document.querySelector('#filter-results');
    document.querySelector('#clear-filters').addEventListener('click', () => this.setMode(0));

    this.log('Map initialized', settings, options);
  }

  /**
   * Uses this.logger for printing
   * @param  {...any} args
   */
  log(...args) {
    if (this.debug) this.logger('YMAP_', ...args);
  }

  /**
   * Highlights polygon with specified Id
   * @param {number} objectId target polygon Id
   * @param {boolean} show turn highlight on/off
   */
  highlight(objectId, show) {
    this.polygonManager.objects
      .setObjectOptions(objectId, { fillOpacity: show ? 0.5 : 0 });
  }

  /**
   * Moves and focuses the map on the selected placemark
   * @param {number} objectId target placemark Id
   */
  // FIXME: Уводит карту при первом нажатии.
  focusPlacemark(objectId) {
    const coords = this.placemarkManager.objects.getById(objectId).geometry.coordinates;
    this.ymap.setCenter(coords, 14);
    this.placemarkManager.objects.balloon.open(objectId);

    this.log('Set focus on placemark', coords);
  }

  // FIXME: Дополнительно проверять на совпадение координат точек
  /**
   * Add placemark collection from data to placemarkManager
   * @param {object} collection object containing type: FeatureCollection and features: []
   */
  addPlacemarks(collection) {
    this.placemarkManager.add(collection);
    collection.features.map((item) => {
      const updated = { ...item };

      updated.options.iconColor = this.serviceTypes[item.options.serviceType].color;
      this.categories[item.options.category].serviceTypes.add(item.options.serviceType);
      this.districts[item.options.district].count += 1;
      this.serviceTypes[item.options.serviceType].count += 1;

      return updated;
    });
    this.log('Added placemarks', collection);
  }

  // FIXME: Петродворцовый и Кронштадтский районы не отображаются
  /**
   * Add polygon collection from data to polygonManager
   * @param {object} collection object containing type: FeatureCollection and features: []
   */
  addPolygons(collection) {
    this.polygonManager.add(collection);
    this.polygonManager.objects.options.set({
      fillColor: '#166A99',
      fillOpacity: 0,
      strokeColor: '#1e98ff',
      strokeOpacity: 0.7,
      strokeWidth: 2,
    });
    // Cache all district names
    this.polygonManager.objects.each((obj) => {
      this.districts.push({ name: obj.properties.hintContent });
    });
    this.polygonManager.events.add(['mouseenter', 'mouseleave'], (e) => {
      this.highlight(e.get('objectId'), e.get('type') === 'mouseenter');
    });

    this.log('Added polygons', collection);
  }

  /**
   * Toggles visibility of all polygons
   * @param {boolean} show
   */
  changePolygonsVisibility(show) {
    this.polygonManager.setFilter(() => show);

    this.log('Changed polygons visibility', show);
  }

  /**
   * Renders all items in collection
   * @param {...any} collection Collection to render
   * @param {(state : number, i : number, view : HTMLElement) => {}} callback
   * Function that will be binded to every item
   * @param {object} state current state Id
   */
  renderResults(collection, callback, state) {
    this.results.innerHTML = '';
    for (let i = 0; i < collection.length; i += 1) {
      const item = collection[i];
      const view = YMapUtils.createFilterItem({ ...item });
      callback(state.id, i, view, item);
      this.results.appendChild(view);
    }

    this.log('Results has been rendered!');
  }

  /**
   * Updates filter controls
   * @param {number} mode current state mode
   */
  updateControls(mode) {
    const n = mode * 2;
    for (let i = 0; i < this.controls.length; i += 2) {
      const element = this.controls[i];
      element.classList.remove('disabled');
      element.classList.remove('active');
      if (i === n) {
        element.classList.add('active');
        element.addEventListener('click', () => this.setMode(mode));
      }
      if (i > n) {
        const clone = element.cloneNode(true);
        clone.classList.add('disabled');
        element.parentNode.replaceChild(clone, element);
      }
    }
  }

  /**
   * Sets the map & filters mode
   * @param {number} id
   * @param {object} data
   */
  setMode(mode, data) {
    if (data) {
      this.state = {
        category: data.category ? data.category : this.state.category,
        type: data.type ? data.type : this.state.type,
        district: data.district ? data.district : this.state.district,
      };
    }
    const id = mode || 0;
    switch (id) {
      case 1: {
        const { serviceTypes } = this.categories[this.state.category];
        const collection = [];
        serviceTypes.forEach((type) => {
          const service = this.serviceTypes[type];
          collection.push({
            name: service.name,
            description: `Организаций ${service.count}`,
            color: service.color,
            type,
          });
        });
        this.renderResults(collection, (state, i, v, item) => {
          v.addEventListener('click', () => {
            this.setMode(state, { type: item.type });
          });
        }, { id: 2 });
        this.placemarkManager.setFilter((obj) => (obj.options.category === this.state.category));
        this.log('Listing services');
        break;
      }
      case 2: {
        const collection = this.districts.map((obj) => ({
          name: obj.name,
          description: '',
        }));
        this.renderResults(collection, (state, i, v) => {
          v.addEventListener('click', () => {
            this.setMode(state, { district: i });
          });
          v.addEventListener('mouseenter', () => {
            this.highlight(i, true);
          });
          v.addEventListener('mouseleave', () => {
            this.highlight(i, false);
          });
        }, { id: 3 });
        this.placemarkManager.setFilter((obj) => (
          obj.options.category === this.state.category)
          && (obj.options.serviceType === this.state.type
          ));
        this.changePolygonsVisibility(true);
        this.log('Listing districts');
        break;
      }
      case 3: {
        const collection = [];
        this.placemarkManager.setFilter((obj) => {
          const valid = (
            (obj.options.category === this.state.category)
            && (obj.options.serviceType === this.state.type)
            && (obj.options.district === this.state.district)
          );
          if (valid) {
            collection.push({
              name: obj.properties.balloonContentHeader,
              description: obj.properties.balloonContentFooter,
              color: obj.options.iconColor,
              id: obj.id,
            });
          }
          return valid;
        });
        this.renderResults(collection, (state, i, v, item) => {
          v.addEventListener('click', () => {
            this.focusPlacemark(item.id);
          });
        }, { id: 3 });
        this.changePolygonsVisibility(false);
        this.log('Listing final results');
        break;
      }
      default: {
        this.state = { category: 0, type: 0, district: 0 };
        const collection = this.categories.map((obj) => ({
          name: obj.name,
          color: obj.color,
          description: `Подкатегорий ${obj.serviceTypes.size || 0}`,
        }));
        this.placemarkManager.setFilter(() => true);
        this.changePolygonsVisibility(false);
        this.renderResults(collection, (state, i, v) => {
          v.addEventListener('click', () => {
            this.setMode(state, { category: i });
          });
        }, { id: 1 });
      }
    }
    this.updateControls(id);

    this.log('Mode changed', id, this.state);
  }
}
