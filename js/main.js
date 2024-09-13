// Initialise the map and set view to default location (e.g., London)
let map = L.map('map').setView([51.505, -0.09], 13);

// Add the OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to add a marker to the map
function addMarker(lat, lon, popupText) {
  L.marker([lat, lon]).addTo(map)
    .bindPopup(popupText)
    .openPopup();
}

// Function to get the user's location and display it on the map
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    document.getElementById("location").innerHTML = "Geolocation is not supported by this browser.";
  }
}

// Function to display the user's location and generate random coordinates
function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  
  // Update location display
  document.getElementById("location").innerHTML = `Latitude: ${lat.toFixed(6)}, Longitude: ${lon.toFixed(6)}`;
  
  // Set map view to the user's location
  map.setView([lat, lon], 13);

  // Get the word input and generate random coordinates
  const word = document.getElementById('word').value;
  displayRandomCoordinates(lat, lon, word);
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
  getLocation(); // Fetch the user's location when the form is submitted
});
