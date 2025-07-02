const map = L.map('map').setView([28.6139, 77.2090], 6); // Default India center

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let routeLayer;
let markerA, markerB;

function getRoute() {
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;

  if (!from || !to) {
    alert("Please enter both locations.");
    return;
  }

  const url = `https://router.project-osrm.org/route/v1/driving/${encodeURIComponent(from)};${encodeURIComponent(to)}?overview=full&geometries=geojson`;

  fetch(`https://nominatim.openstreetmap.org/search?q=${from}&format=json`)
    .then(res => res.json())
    .then(fromData => {
      fetch(`https://nominatim.openstreetmap.org/search?q=${to}&format=json`)
        .then(res => res.json())
        .then(toData => {
          if (!fromData[0] || !toData[0]) {
            alert("Location not found.");
            return;
          }

          const fromCoords = [fromData[0].lat, fromData[0].lon];
          const toCoords = [toData[0].lat, toData[0].lon];

          const routeURL = `https://router.project-osrm.org/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=full&geometries=geojson`;

          fetch(routeURL)
            .then(res => res.json())
            .then(data => {
              const route = data.routes[0];

              if (routeLayer) map.removeLayer(routeLayer);
              if (markerA) map.removeLayer(markerA);
              if (markerB) map.removeLayer(markerB);

              markerA = L.marker(fromCoords, { icon: redPin() }).addTo(map);
              markerB = L.marker(toCoords, { icon: redPin() }).addTo(map);

              routeLayer = L.geoJSON(route.geometry).addTo(map);
              map.fitBounds(routeLayer.getBounds());

              document.getElementById('distance').textContent = (route.distance / 1000).toFixed(2);
              document.getElementById('duration').textContent = (route.duration / 60).toFixed(2);
              document.getElementById('resultBox').style.display = "block";
            });
        });
    });
}

function redPin() {
  return L.icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}
