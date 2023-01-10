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

    // Fonction pour récupérer les informations de l'entreprise
    function extractCompanyInfo(htmlString) {
      var parser = new DOMParser();
      var doc = parser.parseFromString(htmlString, "text/html");

      var companyLogo = doc.querySelector(".company-logo").src;
      var companyName = doc.querySelector(".company-name p").textContent;
      var companyAddress = doc.querySelector(".company-address p").textContent;
      var companyPhone = doc.querySelector(".company-phone p").textContent;
  
      return {
          logo: companyLogo,
          name: companyName,
          address: companyAddress,
          phone: companyPhone
      };
  }  

    company_list = document.getElementById('company-list');

    //Fonction pour effectuer une recherche par localisation
    function searchByLocation() {
      // Récupération de la valeur saisie dans le champ de recherche
      var location = document.getElementById("search-location").value;
      var rayon = document.getElementById("rayon-location").value;

      // Utilisation de la méthode geocode de OpenStreetMap pour obtenir les coordonnées à partir de l'adresse saisie
      var geocoder = new L.Control.Geocoder.Nominatim();
      geocoder.geocode(location, function(results) {
          var latlng = results[0].center;

          // Ajout de marker pour montrer l'emplacement
          // var searchMarker = L.marker(latlng).addTo(macarte);
          var myCircle = L.circle(latlng, {
            color: 'red',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: rayon
          });
        
          myCircle.addTo(macarte);

          // Calculer le zoom pour que le cercle soit bien affiché
          var zoom = macarte.getBoundsZoom(myCircle.getBounds());

          // Centrer et zoomer la carte
          macarte.setView(latlng, zoom);

          // Créer une liste des marqueurs à l'intérieur du cercle
          var markersInCircle = [];
          macarte.eachLayer(function(marker) {
            // console.log(marker)
          // Vérifier si l'objet est un marqueur
          if (marker instanceof L.Marker) {
            // Obtenir la latitude et la longitude du marqueur 
            var latlng = marker.getLatLng();
            // Vérifier si le cercle contient le marqueur
            if (myCircle.getBounds().contains(latlng)) {
              // Récupérer le contenu de la popup
              var popup = marker.getPopup()

                        // Vérifier si l'objet est une popup
          if (popup instanceof L.Popup) {
            // Récupérer le contenu de la popup
            var popupContent = popup.getContent();
          }
              markersInCircle.push(popupContent);
              // console.log(popupContent)
              const company = extractCompanyInfo(popupContent)
              // console.log(company)
              text = `<div class="l-company">
              <img class="company-logo" src="${company.logo}">
              <div class="company-name">
                  <p>${company.name}</p>
              </div>
              <div class="company-address">
                  <p>${company.address}</p>
              </div>
              <div class="company-phone">
                  <p>${company.phone}</p>        
              </div>
          </div>`;
              company_list.innerHTML += text;
            }
          }
          });
          // console.log(markersInCircle)


        });
    }

    var searchInput = document.getElementById("search-location");

    searchInput.addEventListener("keyup", function(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        searchByLocation();
      }
    });

    var rayonInput = document.getElementById("rayon-location");

    rayonInput.addEventListener("keyup", function(event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        searchByLocation();
      }
    });

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