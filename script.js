// script.js

const map = L.map('map').setView([28.6139, 77.2090], 5); // Default India center
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
}).addTo(map);

let routeLayer;

async function getRoute() {
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const mode = document.getElementById('mode').value;

  if (!from || !to) {
    alert('Please enter both source and destination.');
    return;
  }

  const geocode = async (place) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${place}`);
    const data = await res.json();
    return data[0];
  };

  try {
    const [fromData, toData] = await Promise.all([geocode(from), geocode(to)]);
    const fromCoords = [parseFloat(fromData.lat), parseFloat(fromData.lon)];
    const toCoords = [parseFloat(toData.lat), parseFloat(toData.lon)];

    // Fit map bounds
    map.fitBounds([fromCoords, toCoords], { padding: [100, 100] });

    // Remove previous route
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    // Draw new route
    routeLayer = L.Routing.control({
      waypoints: [
        L.latLng(fromCoords[0], fromCoords[1]),
        L.latLng(toCoords[0], toCoords[1])
      ],
      routeWhileDragging: false,
      createMarker: function (i, wp, nWps) {
        return L.marker(wp.latLng, {
          icon: L.icon({
            iconUrl: i === 0 ? 'https://cdn-icons-png.flaticon.com/512/684/684908.png' : 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
          })
        });
      },
      lineOptions: {
        styles: [{ color: '#00ffd5', opacity: 0.8, weight: 6 }]
      },
      addWaypoints: false,
      draggableWaypoints: false
    }).addTo(map);

    // Fetch distance and duration from openroute service or custom logic
    const r = await fetch(`https://router.project-osrm.org/route/v1/driving/${fromCoords[1]},${fromCoords[0]};${toCoords[1]},${toCoords[0]}?overview=false&geometries=geojson`);
    const json = await r.json();
    const route = json.routes[0];
    const distance = (route.distance / 1000).toFixed(2);
    const duration = (route.duration / 60).toFixed(1);

    document.getElementById('distance').innerText = distance;
    document.getElementById('duration').innerText = duration;
    document.getElementById('resultBox').style.display = 'block';

  } catch (error) {
    alert('Error fetching route. Try different locations.');
    console.error(error);
  }
}
