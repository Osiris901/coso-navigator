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
          "preset": "islands#circleIcon"
        }
      }     
    ]
  }
  `;
}
