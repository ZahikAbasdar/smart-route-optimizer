let map = L.map('map').setView([28.6139, 77.2090], 6); // Default: Delhi

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let control;

function getRoute() {
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const mode = document.getElementById('mode').value;
  const icon = {
    driving: '🚗', train: '🚆', air: '✈️'
  }[mode] || '🛣';

  if (control) map.removeControl(control);

  Promise.all([geocode(from), geocode(to)]).then(([start, end]) => {
    control = L.Routing.control({
      waypoints: [L.latLng(start.lat, start.lon), L.latLng(end.lat, end.lon)],
      createMarker: function (i, wp) {
        return L.marker(wp.latLng, {
          icon: L.icon({
            iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
          })
        });
      },
      routeWhileDragging: false,
      show: false
    }).addTo(map);

    const distance = map.distance(
      [start.lat, start.lon],
      [end.lat, end.lon]
    ) / 1000;

    let duration = 0;
    if (mode === 'driving') duration = distance / 60 * 60;
    else if (mode === 'train') duration = distance / 80 * 60;
    else duration = distance / 600 * 60;

    document.getElementById('distance').textContent = distance.toFixed(1);
    document.getElementById('duration').textContent = duration.toFixed(0);
    document.getElementById('modeIcon').textContent = icon;
    document.getElementById('resultBox').style.display = 'block';

  }).catch(() => alert('Invalid locations!'));
}

function geocode(place) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(place)}`;
  return fetch(url)
    .then(res => res.json())
    .then(data => {
      if (!data[0]) throw new Error('No location found');
      return data[0];
    });
}
