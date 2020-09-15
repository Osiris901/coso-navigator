/* eslint-disable no-undef */
export default class YMapUtils {
  static createMap(...args) {
    return new ymaps.Map(...args);
  }

  static createObjectManager({ ...args }) {
    return new ymaps.ObjectManager({ ...args });
  }

  static geocodeFromLocation(location) {
    return ymaps.geocode(location, { json: true, results: 1 })
      .then((res) => res.GeoObjectCollection.featureMember[0]);
  }

  static createFilterItem({ name, description, color }) {
    const item = document.createElement('div');
    const title = document.createElement('h3');
    const text = document.createElement('p');

    item.classList.add('item');
    item.style.borderLeftColor = color || '#166A99';

    title.innerText = name;
    text.innerText = description;

    item.appendChild(title);
    item.appendChild(text);

    return item;
  }
}
