const map = L.map('map').setView([28.6139, 77.2090], 5); // Default to India center

L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

let routeLayer, fromMarker, toMarker;

async function getRoute() {
  const from = document.getElementById("from").value;
  const to = document.getElementById("to").value;
  const mode = document.getElementById("mode").value;
  const resultBox = document.getElementById("resultBox");

  if (!from || !to) {
    alert("Please enter both locations!");
    return;
  }

  try {
    const [fromData, toData] = await Promise.all([
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${from}`).then(res => res.json()),
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${to}`).then(res => res.json())
    ]);

    if (!fromData.length || !toData.length) {
      alert("Location not found.");
      return;
    }

    const fromLatLng = [parseFloat(fromData[0].lat), parseFloat(fromData[0].lon)];
    const toLatLng = [parseFloat(toData[0].lat), parseFloat(toData[0].lon)];

    if (fromMarker) map.removeLayer(fromMarker);
    if (toMarker) map.removeLayer(toMarker);
    if (routeLayer) map.removeLayer(routeLayer);

    fromMarker = L.marker(fromLatLng, { title: "From" }).addTo(map);
    toMarker = L.marker(toLatLng, { title: "To" }).addTo(map);

    const routeData = await fetch(`https://router.project-osrm.org/route/v1/driving/${fromLatLng[1]},${fromLatLng[0]};${toLatLng[1]},${toLatLng[0]}?overview=full&geometries=geojson`).then(res => res.json());

    const coords = routeData.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
    routeLayer = L.polyline(coords, { color: '#00ffd5', weight: 6 }).addTo(map);
    map.fitBounds(routeLayer.getBounds(), { padding: [80, 80] });

    // Distance & Duration
    const distance = (routeData.routes[0].distance / 1000).toFixed(2); // in km
    let duration = (routeData.routes[0].duration / 60).toFixed(0); // in mins

    // Adjust duration based on selected mode
    switch (mode) {
      case "air":
        duration = (distance / 800 * 60).toFixed(0); // Avg plane speed ~800km/h
        break;
      case "train":
        duration = (distance / 70 * 60).toFixed(0); // Avg train speed ~70km/h
        break;
      case "road":
      default:
        // Already calculated from OSRM
        break;
    }

    document.getElementById("distance").textContent = distance;
    document.getElementById("duration").textContent = duration;
    resultBox.style.display = "block";

  } catch (error) {
    console.error("Error fetching route:", error);
    alert("Something went wrong.");
  }
}
