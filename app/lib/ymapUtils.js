/* eslint-disable no-undef */
import regeneratorRuntime from 'regenerator-runtime';

export default class YMapUtils {
  static createMap(...args) {
    return new ymaps.Map(...args);
  }

  static createObjectManager({ ...args }) {
    return new ymaps.ObjectManager({ ...args });
  }

  // CHECK: Проверить правильность использования async
  // https://github.com/babel/babel/issues/9849#issuecomment-487040428
  static async geocodeFromLocation(location, results = 1) {
    let geocode = null;

    const geocoder = ymaps.geocode(location, { json: true, results });
    const res = await geocoder;
    [geocode] = res.GeoObjectCollection.featureMember;

    return geocode;
  }
}
