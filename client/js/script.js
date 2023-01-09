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
        const text = `<div><p>${data[i].name}</p><p>${data[i].address}</p><p>${data[i].phone}</p></div>`;
        marker.bindPopup(text);
        // Ajouter l'écouteur d'événement click au marqueur
        marker.addEventListener('click', (event) => {
          const target = event.target;
          const latLng = target.getLatLng();
          const lat = latLng.lat;
          const lng = latLng.lng;
          zoomToCoords(lat, lng, 15);
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