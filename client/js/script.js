// Create a new Audio instance
var audio = new Audio('http://127.0.0.1:8080/dancin (krono remix) - aaron smith ft. luvli [edit audio].mp3');
audio.loop = true;

document.addEventListener("keydown", function(event) {
  if (event.code === "KeyK") {
      if(audio.paused) {
          audio.play();
      } else {
          audio.pause();
      }
  }
});


// On initialise la latitude et la longitude de Paris (centre de la carte)
var lat = 45.188529;
var lon = 5.724524;
var macarte = null;
// Fonction d'initialisation de la carte
function initMap() {
    // Créer l'objet "macarte" et l'insèrer dans l'élément HTML qui a l'ID "map"
    macarte = L.map('map').setView([lat, lon], 11);
    // Leaflet ne récupère pas les cartes (tiles) sur un serveur par défaut. Nous devons lui préciser où nous souhaitons les récupérer. Ici, openstreetmap.fr
    L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        // Il est toujours bien de laisser le lien vers la source des données
        attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
        minZoom: 1,
        maxZoom: 20
    }).addTo(macarte);

    function fetchData(siret) {
      return fetch(`http://127.0.0.1:9000/api/logo_encoder?siret=${siret}`)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Erreur lors de la récupération des données : " + response.statusText);
        }
      })
      .then(data => {
        return data;
      })
      .catch(error => {
        console.error(error);
      });
  }
    
    function zoomToCoords(lat, lng, zoom) {
        // Créer l'objet de coordonnées
        var latLng = new L.LatLng(lat, lng);
        // Zoomez sur les coordonnées avec la valeur de zoom spécifiée
        macarte.flyTo(latLng, zoom, {
            animate: true,
            duration: 2 // in seconds
          });
    }
    
    function splitCoordinates(coordinates) {
        // Séparation des coordonnées en utilisant la virgule comme séparateur
        var parts = coordinates.split(',');
        
        // La latitude se trouve dans la première partie, la longitude dans la seconde
        var latitude = parts[0];
        var longitude = parts[1];
        return [latitude, longitude];
    } 
    
    fetch('http://127.0.0.1:8000/api/company')
    .then(response => response.json())
    .then(data => {
      // Traiter les données ici
      for (let i = 0; i < data.length; i++) {
        coords = splitCoordinates(data[i].coords);
        let marker = L.marker([coords[0], coords[1]]).addTo(macarte);    
        fetchData(data[i].siret).then(img => {
          const logo = img;
          const text = `<div class="company">
          <img class="company-logo" src="data:image/jpeg;base64,${logo}">
          <div class="company-name">
              <p>${data[i].name}</p>
          </div>
          <div class="company-address">
              <p>${data[i].address}</p>
          </div>
          <div class="company-phone">
              <p>${data[i].phone}</p>
          </div>
      </div>`;
          marker.bindPopup(text);
          // Ajouter l'écouteur d'événement click au marqueur
          marker.addEventListener('click', (event) => {
            const target = event.target;
            const latLng = target.getLatLng();
            const lat = latLng.lat;
            const lng = latLng.lng;
            zoomToCoords(lat, lng, 15);
          });
        });
      }  
        })
        .catch(error => {
        // Gérer l'erreur ici
        });
        }
        window.onload = function(){
        // Fonction d'initialisation qui s'exécute lorsque le DOM est chargé
        initMap();
};