let map = L.map('map').setView([36.5, 127.8], 7);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let allData = [];
let markers = [];
let dates = [];

const startSlider = document.getElementById('startSlider');
const endSlider = document.getElementById('endSlider');
const dateLabel = document.getElementById('dateRangeLabel');
const listBox = document.getElementById('caseList');

function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

function updateView(startDate, endDate) {
  clearMarkers();
  listBox.innerHTML = '';
  const filtered = allData.filter(d => d.date >= startDate && d.date <= endDate);

  const bounds = L.latLngBounds();
  filtered.forEach(d => {
    const marker = L.marker([d.lat, d.lon]).addTo(map);
    marker.bindPopup(`<b>${d.location}</b><br>${d.date}<br>${d.sample}`);
    markers.push(marker);
    bounds.extend(marker.getLatLng());

    const item = document.createElement('div');
    item.textContent = `📍 ${d.date} - ${d.location} (${d.sample})`;
    listBox.appendChild(item);
  });

  if (filtered.length) map.fitBounds(bounds);
}

async function loadData() {
  const res = await fetch('/infection-status');
  allData = await res.json();

  dates = [...new Set(allData.map(d => d.date))].sort();
  const max = dates.length - 1;

  startSlider.min = 0;
  startSlider.max = max;
  startSlider.value = 0;

  endSlider.min = 0;
  endSlider.max = max;
  endSlider.value = max;

  function updateSliders() {
    const startDate = dates[parseInt(startSlider.value)];
    const endDate = dates[parseInt(endSlider.value)];
    if (startDate > endDate) return;
    dateLabel.textContent = `${startDate} ~ ${endDate}`;
    updateView(startDate, endDate);
  }

  startSlider.oninput = updateSliders;
  endSlider.oninput = updateSliders;

  updateSliders();
}

loadData();
