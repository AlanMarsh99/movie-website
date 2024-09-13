// Initialise the map and set view to default location (e.g., Dublin)
let map = L.map('map').setView([53.35, -6.26], 11);

// Add Street View Layer (OpenStreetMap)
let streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Add Satellite View Layer (OpenTopoMap)
let satelliteLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenTopoMap'
});

// CartoDB Positron (Light Themed Map)
let cartoPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.carto.com/">CARTO</a>'
});

// CartoDB Dark Matter (Dark Themed Map)
let cartoDarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.carto.com/">CARTO</a>'
});

// Esri World Imagery (Satellite Imagery)
let esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// Layer group to manage markers
let markerGroup = L.layerGroup().addTo(map);

// Function to add a marker to the map
function addMarker(lat, lon, popupText) {
  // Clear all existing markers
  markerGroup.clearLayers();
  
  // Add a new marker to the layer group
  const marker = L.marker([lat, lon]).bindPopup(popupText).openPopup();
  markerGroup.addLayer(marker);
}

// Global variable to store user's location
let userLocation = { latitude: null, longitude: null };

// Function to get the user's location and display it on the map
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    document.getElementById("location").innerHTML = "Geolocation is not supported by this browser.";
  }
}

// Function to display the user's location and store it globally for reuse
function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  
  // Store user's original location for future use
  userLocation.latitude = lat;
  userLocation.longitude = lon;

  // Update location display
  document.getElementById("location").innerHTML = `Latitude: ${lat.toFixed(6)}, Longitude: ${lon.toFixed(6)}`;
  
  // Get the word input and generate random coordinates based on user's location
  const word = document.getElementById('word').value;
  displayRandomCoordinates(userLocation.latitude, userLocation.longitude, word);
}

// Function to generate random coordinates within a given radius (in meters) and using the word as an influence
function getRandomCoordinates(lat, lon, radius, wordHash) {
  const r = radius / 111300; // Convert radius from meters to degrees
  const u = (Math.random() + wordHash) % 1; // Use the word hash to influence randomness
  const v = (Math.random() + wordHash) % 1;
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const newLat = w * Math.cos(t);
  const newLon = w * Math.sin(t) / Math.cos(lat * (Math.PI / 180));

  const finalLat = lat + newLat;
  const finalLon = lon + newLon;

  return { latitude: finalLat, longitude: finalLon };
}

// Simple hash function to convert the word to a numeric value
function hashWord(word) {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = (hash << 5) - hash + word.charCodeAt(i);
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash) % 1000 / 1000; // Normalize to a decimal between 0 and 1
}

// Function to display the generated random coordinates
function displayRandomCoordinates(lat, lon, word) {
  const radius = parseInt(document.getElementById('radius-range').value, 10); // Get radius from the form
  const wordHash = hashWord(word); // Hash the word to influence randomness
  const randomCoords = getRandomCoordinates(lat, lon, radius, wordHash);
  
  // Update destination display
  document.getElementById("coordinates").innerHTML = `Destination: Latitude: ${randomCoords.latitude.toFixed(6)}, Longitude: ${randomCoords.longitude.toFixed(6)}`;
  
  // Add marker for random coordinates
  addMarker(randomCoords.latitude, randomCoords.longitude, `Destination (influenced by "${word}")`);
}

// Feature: Add Layer Control for multiple views
L.control.layers({
  "Street View": streetLayer,
  "Satellite View": satelliteLayer,
  "Light": cartoPositron,
  "Dark": cartoDarkMatter,
  "Colour": esriWorldImagery
}).addTo(map);

// Error handling for geolocation
function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      document.getElementById("location").innerHTML = "User denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      document.getElementById("location").innerHTML = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      document.getElementById("location").innerHTML = "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      document.getElementById("location").innerHTML = "An unknown error occurred.";
      break;
  }
}

// Handle form submission
document.getElementById("generator-form").addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent form from refreshing the page

  // Get the word input
  const word = document.getElementById('word').value;

  // Check if the word is empty
  if (!word.trim()) {
    alert('Please provide a keyword to generate a location.');
    return; // Stop further execution if the word is empty
  }

  getLocation(); // Fetch the user's location when the form is submitted
});

document.getElementById("generator-form").addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent form from refreshing the page

  // Get the word input
  const word = document.getElementById('word').value;

  // Check if the word is empty or contains invalid characters
  const regex = /^[A-Za-z\s]+$/;
  if (!word.trim()) {
    alert('Please provide a keyword to generate a location.');
    return; // Stop further execution if the word is empty
  } else if (!regex.test(word)) {
    alert('Only alphabetic characters and spaces are allowed.');
    return; // Stop further execution if the word contains invalid characters
  }

  getLocation(); // Fetch the user's location when the form is submitted
});
