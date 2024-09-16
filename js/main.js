// Initialize the map and set view to default location (e.g., Dublin)
let map = L.map('map').setView([53.35, -6.26], 11);

// Add Street View Layer (OpenStreetMap)
let streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
}).addTo(map);

// Add Satellite View Layer (OpenTopoMap)
let satelliteLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
  maxZoom: 19
});

// CartoDB Positron (Light Themed Map)
let cartoPositron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 19
});

// CartoDB Dark Matter (Dark Themed Map)
let cartoDarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  maxZoom: 19
});

// Esri World Imagery (Satellite Imagery)
let esriWorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 19
});

// Layer group to manage markers
let markerGroup = L.layerGroup().addTo(map);

// Function to add a marker to the map with a popup
function addMarker(lat, lon) {
  // Clear all existing markers
  markerGroup.clearLayers();
  
  // Add a new marker with a popup that says "Your next destination"
  const marker = L.marker([lat, lon])
    .bindPopup("Your next destination") // Popup
    .addTo(map);

  markerGroup.addLayer(marker);
}

// Global variable to store user's location
let userLocation = { latitude: null, longitude: null };

// Mapping of phrases to specific locations (keys in lower case)
const phraseLocations = {
  "arcadian shepherd": { latitude: 53.2517056, longitude: -6.3303264 },
  "swans nest": { latitude: 53.389811, longitude: -6.160821 },
  "kccp": { latitude: 53.385433686837544, longitude: -6.159285306930543 }
};

// Function to calculate distance between two coordinates (in meters)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radius of Earth in meters
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in meters

  return d;
}

// Function to get the user's location and display it on the map
function getLocation(word) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      showPosition(position, word);
    }, showError);
  } else {
    document.getElementById("location").innerHTML = "Geolocation is not supported by this browser.";
  }
}

// Function to display the user's location and store it globally for reuse
function showPosition(position, word) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  
  // Store user's original location for future use
  userLocation.latitude = lat;
  userLocation.longitude = lon;

  // Generate random coordinates based on user's location
  displayRandomCoordinates(userLocation.latitude, userLocation.longitude, word);
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

// Function to display the generated random coordinates
function displayRandomCoordinates(lat, lon, word) {
  const radius = parseInt(document.getElementById('radius-range').value, 10); // Get radius from the form

  // Normalize word to lower case and trim whitespace
  word = word.toLowerCase().trim();

  // Check if the word is a special phrase
  if (phraseLocations.hasOwnProperty(word)) {
    const location = phraseLocations[word];
    // Calculate distance between user's location and the phrase's location
    const distance = calculateDistance(lat, lon, location.latitude, location.longitude);

    if (distance <= radius) {
      // Location is within radius
      // Update destination display
      document.getElementById("coordinates").innerHTML = `Destination: Latitude: ${location.latitude.toFixed(6)}, Longitude: ${location.longitude.toFixed(6)}`;
      
      // Add marker for the specific location
      addMarker(location.latitude, location.longitude);
      
      // Center map on the specific location
      map.setView([location.latitude, location.longitude], 13);
      return; // Exit the function
    } else {
    }
  }
  
  // If word is not in phraseLocations or the location is outside the radius, proceed with random coordinate generation
  const wordHash = hashWord(word); // Hash the word to influence randomness
  const randomCoords = getRandomCoordinates(lat, lon, radius, wordHash);
  
  // Update destination display
  document.getElementById("coordinates").innerHTML = `Destination: Latitude: ${randomCoords.latitude.toFixed(6)}, Longitude: ${randomCoords.longitude.toFixed(6)}`;
  
  // Add marker for random coordinates with tooltip
  addMarker(randomCoords.latitude, randomCoords.longitude);
  
  // Center map on the random coordinates
  map.setView([randomCoords.latitude, randomCoords.longitude], 13);
}

// Feature: Add Layer Control for multiple views
L.control.layers({
  "Street View": streetLayer,
  "Satellite View": satelliteLayer,
  "Light": cartoPositron,
  "Dark": cartoDarkMatter,
  "Satellite Imagery": esriWorldImagery
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
  let word = document.getElementById('word').value;

  // Normalize word to lower case and trim whitespace
  word = word.toLowerCase().trim();

  // Check if the word is empty or contains invalid characters
  const regex = /^[a-z\s]+$/; // Only lower case letters and spaces
  if (!word.trim()) {
    alert('Please provide a keyword to generate a location.');
    return; // Stop further execution if the word is empty
  } else if (!regex.test(word)) {
    alert('Only alphabetic characters and spaces are allowed.');
    return; // Stop further execution if the word contains invalid characters
  }

  getLocation(word); // Pass the word to getLocation
});

// Handle the slider value display
const radiusRange = document.getElementById('radius-range');
const radiusValue = document.getElementById('radius-value');

radiusRange.addEventListener('input', function() {
  radiusValue.innerText = radiusRange.value;
});
