// URL for the earthquake data
const earthquakeDataURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Pull earthquake data from the provided URL
fetch(earthquakeDataURL)
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then(data => {
    // Once data is pulled from URL, process it
    processData(data);
  })
  .catch(error => {
    console.error("There was a problem fetching earthquake data:", error);
  });

// Function to process fetched earthquake data
function processData(data) {
  // Create an empty array to store earthquake markers
  const markers = [];

  // Iterate through the earthquake data features
  data.features.forEach(feature => {
    const { geometry, properties } = feature;
    const { coordinates } = geometry;
    const [longitude, latitude, depth] = coordinates;
    const magnitude = properties.mag;

    // Calculate marker size based on earthquake magnitude
    const markerSize = Math.sqrt(magnitude) * 5;

    // Calculate marker color based on earthquake depth
    const depthColor = depth > 70 ? '#d73027' : depth > 30 ? '#fc8d59' : '#fee08b';

    // Create a marker for each earthquake and add it to the markers array
    const marker = L.circleMarker([latitude, longitude], {
      radius: markerSize,
      fillColor: depthColor,
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    }).bindPopup(`<b>${properties.place}</b><br/>Magnitude: ${magnitude}<br/>Depth: ${depth} km`);
    
    markers.push(marker);
  });

  // Create a layer group from the markers array
  const earthquakeLayer = L.layerGroup(markers);

  // Create a map centered on a default location
  const map = L.map('map').setView([0, 0], 2);

  // Add a tile layer for the base map
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  // Add the earthquake layer to the map
  earthquakeLayer.addTo(map);

  // Define a legend
  const legend = L.control({ position: 'bottomright' });

  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    const grades = [0, 30, 70];
    const colors = ['#fee08b', '#fc8d59', '#d73027'];

    div.innerHTML += '<b>Depth Legend</b><br>';
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colors[i] + '"></i> ' +
        grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + ' km<br>' : '+ km');
    }

    return div;
  };

  // Add legend to the map
  legend.addTo(map);
}


