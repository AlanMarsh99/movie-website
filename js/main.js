// Initialise the map and set view to default location
let map = L.map('map').setView([51.505, -0.09], 13); // Default to London coordinates

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
  document.getElementById("location").innerHTML = `Latitude: ${lat}, Longitude: ${lon}`;
  
  // Set map view to the user's location
  map.setView([lat, lon], 13);
  
  // Add marker for user's location
  addMarker(lat, lon, "Your Location");

  // Generate and display random coordinates
  displayRandomCoordinates(lat, lon);
}

// Function to generate random coordinates within a given radius (in meters)
function getRandomCoordinates(lat, lon, radius) {
  const r = radius / 111300; // Convert radius from meters to degrees
  const u = Math.random();
  const v = Math.random();
  const w = r * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const newLat = w * Math.cos(t);
  const newLon = w * Math.sin(t) / Math.cos(lat * (Math.PI / 180));

  const finalLat = lat + newLat;
  const finalLon = lon + newLon;

  return { latitude: finalLat, longitude: finalLon };
}

// Function to display the generated random coordinates
function displayRandomCoordinates(lat, lon) {
  const radius = 1000; // Set radius to 1000 meters (1 km)
  const randomCoords = getRandomCoordinates(lat, lon, radius);
  
  // Update random coordinates display
  document.getElementById("coordinates").innerHTML = `Latitude: ${randomCoords.latitude.toFixed(6)}, Longitude: ${randomCoords.longitude.toFixed(6)}`;
  
  // Add marker for random coordinates
  addMarker(randomCoords.latitude, randomCoords.longitude, "Random Coordinates");
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
document.getElementById("word-form").addEventListener("submit", function(event) {
  event.preventDefault(); // Prevent form from refreshing the page
  getLocation(); // Fetch the user's location when the form is submitted
});
