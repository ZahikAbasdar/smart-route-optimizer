// Initialize the map
const map = L.map('map').setView([32.5, 76], 7); // Center between Ludhiana & Srinagar

// Load tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Load input values
function drawRoute() {
  const fromInput = document.getElementById('from').value.split(',').map(Number);
  const toInput = document.getElementById('to').value.split(',').map(Number);

  const ORS_API_KEY = "5b3ce3597851110001cf6248dac9cefc641e414aab23697008fc6388"; // Paste your key here

  // Add markers
  L.marker(fromInput).addTo(map).bindPopup("Start: Ludhiana").openPopup();
  L.marker(toInput).addTo(map).bindPopup("End: Srinagar");

  // Fetch route
  axios.post('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
    coordinates: [fromInput, toInput]
  }, {
    headers: {
      'Authorization': ORS_API_KEY,
      'Content-Type': 'application/json'
    }
  })
  .then(res => {
    const geo = res.data;
    L.geoJSON(geo, {
      style: {
        color: '#00FFFF',
        weight: 5,
        opacity: 0.8
      }
    }).addTo(map);

    // Zoom to route
    map.fitBounds([
      [fromInput[0], fromInput[1]],
      [toInput[0], toInput[1]]
    ]);
  })
  .catch(err => {
    alert('Failed to fetch route. Check API key or coordinates.');
    console.error(err);
  });
}

// Auto-run on load
drawRoute();
