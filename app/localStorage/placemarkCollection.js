export default function res() {
  return `
  {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "id": 0,
        "geometry": {
          "type": "Point",
          "coordinates": [59.931283, 30.406508]
        },
        "properties": {
          "balloonContent": "Общество с ограниченной ответственностью «Гармония»"
        },
        "options": {
          "preset": "islands#circleIcon",
          "categoryTypes": [1, 2],
          "district": 10
        }
      },
      {
        "type": "Feature",
        "id": 1,
        "geometry": {
          "type": "Point",
          "coordinates": [59.957354, 30.343914]
        },
        "properties": {
          "balloonContent": "Общество с ограниченной ответственностью «Социальный гериатрический центр «Опека Комфорт»"
        },
        "options": {
          "preset": "islands#circleIcon",
          "categoryTypes": [0, 4],
          "district": 2
        }
      }     
    ]
  }
  `;
}
