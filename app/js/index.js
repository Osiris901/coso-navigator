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

const serviceTypes = [
  { name: 'Психологическая помощь', color: '#1E98FF', count: 0 },
  { name: 'Юридические услуги', color: '#0E4779', count: 0 },
  { name: 'Поиск работы и обучение', color: '#ED4543', count: 0 },
];

function changeTab(id, callback) {
  let i;

  console.log('changing tab', id);

  const tabLinks = document.querySelectorAll('.filter');
  for (i = 0; i < tabLinks.length; i += 1) {
    const el = tabLinks[i];
    el.classList.remove('active');
  }

  const tabContents = document.querySelectorAll('.results');
  for (i = 0; i < tabContents.length; i += 1) {
    const el = tabContents[i];
    el.classList.remove('current');
  }

  const activeLink = tabLinks[id];
  activeLink.classList.add('active');
  const activeTab = tabContents[id];
  activeTab.classList.add('current');

  callback(id);
}

function initControls(map) {
  const tabControl = document.querySelectorAll('.filter');

  for (let i = 0; i < tabControl.length; i += 1) {
    ((id) => {
      const el = tabControl[i];
      el.addEventListener('click', () => changeTab(id, map.changeView));
    })(i);
  }
}

function createResultItem({ name, color, count }, filter) {
  const item = document.createElement('div');
  const title = document.createElement('h3');
  const description = document.createElement('p');
  // item.addEventListener('click', (e) => onClick(e));
  item.classList.add('item');
  item.style.borderLeftColor = color || '#166A99';
  title.innerText = name;
  description.innerText = count ? `${count} организаций` : '';
  item.appendChild(title);
  item.appendChild(description);
  return item;
}

function getResults(st, d) {
  const stRoot = document.querySelector('#serviceTypes');
  for (let i = 0; i < st.length; i += 1) {
    const item = createResultItem(st[i]);
    stRoot.appendChild(item);
  }

  const dRoot = document.querySelector('#districts');
  for (let i = 0; i < d.length; i += 1) {
    const item = createResultItem(d[i]);
    dRoot.appendChild(item);
  }
}

// eslint-disable-next-line no-undef
ymaps.ready({
  successCallback: () => {
    const map = new YMap({
      root: 'map-div', settings: defaults.settings, options: defaults.options, debug: true, logger: console.log, serviceTypes,
    });
    map.initManagers();
    map.addPolygons(getPolygons());
    map.addPlacemarks(getPlacemarks());
    map.changeView(map.viewMode);
    getResults(map.serviceTypes, map.districts);
    initControls(map);
    map.initFilters();
  },
  errorCallback: (context) => {
    console.log(context);
  },
});
