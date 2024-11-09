if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(success, error, {
    enableHighAccuracy:true,
    timeout:10000,
    maximumAge:0
  });
} else {
  console.log("Geolocation is not supported by this browser.");
}

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.querySelector(".Search-btn");
  btn.addEventListener("click", () => {  
    document.querySelector(".Hospital-list").innerHTML="";
    navigator.geolocation.getCurrentPosition(success, error); 
  });
});

function success(position) {
  let type = document.querySelector("#type").value.toLowerCase();
  let amenity=((type!=='select type') ? type:"hospital").toLowerCase();
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;
  const overpassQuery = `
    [out:json];
    node["amenity"="${amenity}"](around:5000,${latitude},${longitude});
    out body;
    `;

  const url = "https://overpass-api.de/api/interpreter";
  const data = new URLSearchParams();
  data.append("data", overpassQuery);

  fetch(url, {
    method: "POST",
    body: data,
  })
    .then((response) => response.json())
    .then((data) => {
      const hospitals = prepareHospitals(data, latitude, longitude);
      populateTable(hospitals);
    })
    .catch((error) => {
      console.error("Error fetching data from Overpass API:", error);
    });
}

function error() {
  console.log("Unable to retrieve your location.");
}

function prepareHospitals(data, userLat, userLon) {
  // Create an array of hospitals with their distances
  const hospitals = data.elements.map((element) => {
    const hospitalLat = parseFloat(element.lat.toFixed(6));
    const hospitalLon = parseFloat(element.lon.toFixed(6));
    const distance = calculateDistance(
      userLat,
      userLon,
      hospitalLat,
      hospitalLon
    );
    return {
      name: element.tags.name,
      distance: distance,
    };
  });

  // Sort hospitals by distance in increasing order
  hospitals.sort((a, b) => a.distance - b.distance);

  return hospitals;
}

function populateTable(hospitals) {
  const tableBody = document.querySelector(".Hospital-list");
  
  const Tbody = document.createElement("tbody");
  tableBody.appendChild(Tbody);

  hospitals.forEach((hospital) => {
    if (hospital.name) {
      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      const namelink=document.createElement("a");
      namelink.innerHTML=hospital.name;
      const query = encodeURIComponent(hospital.name);
      namelink.href=`https://www.google.com/search?q=${query}`;
      namelink.target="blank";
      nameCell.appendChild(namelink);

      const distanceCell = document.createElement("td");
      distanceCell.textContent = hospital.distance.toFixed(2) + " km";

      row.appendChild(nameCell);
      row.appendChild(distanceCell);

      Tbody.appendChild(row);
    }
  });
}

// Haversine formula to calculate distance between two lat/lon points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}
