const map = L.map('map').setView([32.5, 75.3], 6); // Center between Ludhiana & Srinagar

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const ludhiana = [30.900965, 75.857276];
const srinagar = [34.083656, 74.797371];

L.marker(ludhiana).addTo(map).bindPopup('<b>Ludhiana</b>').openPopup();
L.marker(srinagar).addTo(map).bindPopup('<b>Srinagar</b>');

L.polyline([ludhiana, srinagar], {
  color: '#1abc9c',
  weight: 5,
  dashArray: '10,10',
}).addTo(map);
