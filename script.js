let map = L.map('map').setView([28.6139, 77.2090], 5); // Initial center: India

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

let routeLine, fromMarker, toMarker;

async function getRoute() {
  const from = document.getElementById("from").value.trim();
  const to = document.getElementById("to").value.trim();
  const mode = document.getElementById("mode").value;

  if (!from || !to) {
    alert("Please enter both FROM and TO locations.");
    return;
  }

  const fromCoord = await getCoordinates(from);
  const toCoord = await getCoordinates(to);

  if (!fromCoord || !toCoord) {
    alert("Could not find coordinates for the entered locations.");
    return;
  }

  if (routeLine) map.removeLayer(routeLine);
  if (fromMarker) map.removeLayer(fromMarker);
  if (toMarker) map.removeLayer(toMarker);

  fromMarker = L.marker(fromCoord, { title: 'From 📍', icon: redIcon }).addTo(map);
  toMarker = L.marker(toCoord, { title: 'To 📍', icon: redIcon }).addTo(map);

  const routeRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${fromCoord[1]},${fromCoord[0]};${toCoord[1]},${toCoord[0]}?overview=full&geometries=geojson`);
  const routeData = await routeRes.json();

  const coords = routeData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
  const distance = (routeData.routes[0].distance / 1000).toFixed(2);
  const duration = Math.round(routeData.routes[0].duration / 60);

  routeLine = L.polyline(coords, { color: '#00ffd5', weight: 5 }).addTo(map);
  map.fitBounds(routeLine.getBounds());

  const resultBox = document.getElementById("resultBox");
  document.getElementById("distance").innerText = distance;
  document.getElementById("duration").innerText = duration;

  let icon = mode === "air" ? "✈️" : mode === "train" ? "🚆" : "🚗";
  document.getElementById("modeIcon").innerText = icon;
  resultBox.style.display = "block";
}

// Geocoding helper using Nominatim API
async function getCoordinates(location) {
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
  const data = await res.json();
  if (data && data.length > 0) {
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }
  return null;
}

// Custom red map icon
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
