let map = L.map('map').setView([28.6139, 77.2090], 5); // Default to India

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let routeLayer;

async function getRoute() {
  const from = document.getElementById('from').value.trim();
  const to = document.getElementById('to').value.trim();
  const mode = document.getElementById('mode').value;

  if (!from || !to) {
    alert("Please enter both locations.");
    return;
  }

  // Icons for transport mode
  const modeIcons = {
    driving: "🚗",
    train: "🚆",
    air: "✈️"
  };

  document.getElementById("modeIcon").innerText = modeIcons[mode] || "🛣";

  const fromCoord = await getCoordinates(from);
  const toCoord = await getCoordinates(to);

  if (!fromCoord || !toCoord) {
    alert("Couldn't find one of the locations. Please check the spelling.");
    return;
  }

  // Clear previous route
  if (routeLayer) {
    map.removeLayer(routeLayer);
  }

  // Draw new route
  routeLayer = L.Routing.control({
    waypoints: [
      L.latLng(fromCoord.lat, fromCoord.lon),
      L.latLng(toCoord.lat, toCoord.lon)
    ],
    routeWhileDragging: false,
    createMarker: function (i, wp, nWps) {
      return L.marker(wp.latLng, {
        icon: L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
          iconSize: [40, 40],
          iconAnchor: [20, 40]
        })
      });
    }
  }).addTo(map);

  // Fetch and display distance & duration
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${fromCoord.lon},${fromCoord.lat};${toCoord.lon},${toCoord.lat}?overview=false`;

  const res = await fetch(osrmUrl);
  const data = await res.json();

  if (data.routes && data.routes.length > 0) {
    const route = data.routes[0];
    const distanceKm = (route.distance / 1000).toFixed(2);
    const durationMin = (route.duration / 60).toFixed(1);

    document.getElementById("distance").innerText = distanceKm;
    document.getElementById("duration").innerText = durationMin;
    document.getElementById("resultBox").style.display = "block";
  } else {
    alert("Route not found.");
  }
}

async function getCoordinates(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data[0];
}
