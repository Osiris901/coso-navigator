import regeneratorRuntime from 'regenerator-runtime';

export default class YMapUtils {
  static getPlacemarkData({ geocode, location, name, contacts, ...args }) {
    return {
      geocode,
      header: name,
      content: contacts,
      footer: location,
      ...args,
    };
  }

  // TODO: Создать конечный список районов, чтобы отобразить его без обработки
  static getDistrictsFromObj(obj, isFinal, { debug, logger }) {
    let districts = [];
    if (isFinal) {
      districts = obj;
    } else {
      for (let i = 0; i < obj.length; i += 1) {
        const geocodes = obj[i].territory.map(
          (geocode) => [parseFloat(geocode.lat), parseFloat(geocode.lng)]
        );
        districts.push({ geocodes, name: obj[i].district });
      }
    }
    if (debug && typeof logger === 'function') logger('Loaded district list', districts);
    return [...districts];
  }

  static createPlacemark({ geocode, placemarkData, debug, logger }) {
    if (debug && typeof logger === 'function') logger('Creating Placemark', geocode, placemarkData);
    return new ymaps.Placemark(geocode, {
      balloonContentHeader: placemarkData.header,
      balloonContent: placemarkData.content,
      balloonContentFooter: placemarkData.footer,
    }, {
      preset: 'islands#circleIcon',
      iconColor: placemarkData.color,
    });
  }

  static createClusterer(placemarks) {
    const clusterer = new ymaps.Clusterer({
      clusterIconLayout: 'default#pieChart',
      clusterIconPieChartRadius: 25,
      clusterIconPieChartCoreRadius: 10,
      clusterIconPieChartStrokeWidth: 3,
      hasBalloon: false,
      checkZoomRange: true,
    });
    clusterer.add(placemarks);
    return clusterer;
  }

  static createPolygon({ geocodes, name, debug, logger }) {
    if (debug && typeof logger === 'function') logger('Creating Polygon', name, geocodes);
    const polygon = new ymaps.Polygon([geocodes], {
      hintContent: name,
    }, {
      fillColor: '#166A99',
      strokeColor: '#ffffff',
      fillOpacity: 0.5,
      strokeOpacity: 0.5,
      strokeWidth: 2,
      strokeStyle: 'solid',
    });
    polygon.events
      .add('mouseenter', (e) => {
        e.get('target').options.set('fillOpacity', 0.7);
      })
      .add('mouseleave', (e) => {
        e.get('target').options.set('fillOpacity', 0.5);
      });
    return polygon;
  }

  // CHECK: Проверить правильность использования async
  // https://github.com/babel/babel/issues/9849#issuecomment-487040428
  static async geocodeFromLocation(location, results = 1, { debug, logger }) {
    let geocode = null;

    const geocoder = ymaps.geocode(location, { json: true, results });
    const res = await geocoder;
    [geocode] = res.GeoObjectCollection.featureMember;

    if (debug && typeof logger === 'function') logger('Geocode task', location, res);

    return geocode;
  }
}
