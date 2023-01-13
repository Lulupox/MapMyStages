// Créer une nouvelle instance Audio
var audio = new Audio('http://127.0.0.1:8080/dancin (krono remix) - aaron smith ft. luvli [edit audio].mp3');
audio.loop = true;

document.addEventListener("keydown", function(event) {
	if (event.code === "KeyK") {
		if (audio.paused) {
			audio.play();
		} else {
			audio.pause();
		}
	}
});

// Initialiser la latitude et la longitude de Paris (centre de la carte)
var lat = 45.188529;
var lon = 5.724524;
var macarte = null;

// Fonction d'initialisation de la carte
function initMap() {
	// Créer l'objet "macarte" et l'insérer dans l'élément HTML qui a l'ID "map"
	macarte = L.map('map').setView([lat, lon], 11);
	// Leaflet ne récupère pas les cartes (tiles) sur un serveur par défaut. Nous devons lui préciser où nous souhaitons les récupérer. Ici, openstreetmap.fr
	L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
		// Il est toujours bien de laisser le lien vers la source des données
		attribution: 'données © <a href="//osm.org/copyright">OpenStreetMap</a>/ODbL - rendu <a href="//openstreetmap.fr">OSM France</a>',
		minZoom: 1,
		maxZoom: 20
	}).addTo(macarte);

	function removeCircles() {
		macarte.eachLayer(function(layer) {
			if (layer instanceof L.Circle) {
				macarte.removeLayer(layer);
			}
		});
	}

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

	// Fonction pour effectuer une recherche par localisation
	function searchByLocation() {
		// Récupérer la valeur saisie dans le champ de recherche
		var location = document.getElementById("search-location").value;
		var rayon = document.getElementById("rayon-location").value;

		// Utiliser la méthode geocode de OpenStreetMap pour obtenir les coordonnées à partir de l'adresse saisie
		var geocoder = new L.Control.Geocoder.Nominatim();
		geocoder.geocode(location, function(results) {
			var latlng = results[0].center;

			// Ajouter un marqueur pour montrer l'emplacement
			// var searchMarker = L.marker(latlng).addTo(macarte);
			var myCircle = L.circle(latlng, {
				color: 'red',
				fillColor: '#f03',
				fillOpacity: 0.5,
				radius: rayon
			});
			removeCircles();
			document.querySelector('#company-list').innerHTML = ``;
			myCircle.addTo(macarte);


			// Calculer le zoom pour que le cercle soit bien affiché
			var zoom = macarte.getBoundsZoom(myCircle.getBounds());

			// Centrer et zoomer la carte
			macarte.setView(latlng, zoom);

			// Créer une liste des marqueurs à l'intérieur du cercle
			var markersInCircle = [];
			macarte.eachLayer(function(marker) {
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
						const company = extractCompanyInfo(popupContent)
						text = `<div class="l-company" data-coords="${[latlng['lat'], latlng['lng']]}">
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
			let companies = document.querySelectorAll(".l-company");

			for (let i = 0; i < companies.length; i++) {
				companies[i].addEventListener("click", function() {
					let location = splitCoordinates(this.dataset.coords)
					zoomToCoords(location[0], location[1], 18)
				});
			}


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

	async function fetchData(siret) {
		try {
		  const apiUrl = 'http://localhost:9000/api/logo_encoder';
		  const params = new URLSearchParams({siret});
		  const response = await fetch(`${apiUrl}?${params}`);
		  if (!response.ok) {
			throw new Error(`Error ${response.status}: ${response.statusText}`);
		  }
		  const data = await response.json();
		  return data;
		} catch (error) {
		  console.error(error);
		}
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

	fetch('http://127.0.0.1:8000/companies')
		.then(response => response.json())
		.then(data => {
			console.log
			// Traiter les données ici
			for (let i = 0; i < data.length; i++) {
				coords = splitCoordinates(data[i]['company'].coords);
				let marker = L.marker([coords[0], coords[1]]).addTo(macarte);
				fetchData(data[i]['company'].siret).then(img => {
					const logo = img;
					const text = `<div class="company">
          <img class="company-logo" src="data:image/jpeg;base64,${logo}">
          <div class="company-name">
              <p>${data[i]['company'].name}</p>
          </div>
          <div class="company-address">
              <p>${data[i]['company'].address}</p>
          </div>
          <div class="company-phone">
              <p>${data[i]['company'].phone}</p>
          </div>
      </div>`;
					marker.bindPopup(text);
					// Ajouter l'écouteur d'événement click au marqueur
					marker.addEventListener('click', (event) => {
						const target = event.target;
						const latLng = target.getLatLng();
						const lat = latLng.lat;
						const lng = latLng.lng;
						zoomToCoords(lat, lng, 18);
					});
				});
			}
		})
		.catch(error => {
			// Gérer l'erreur ici
		});
}
window.onload = function() {
	setTimeout(function() {
		var loader = document.getElementsByClassName("loader")[0];
		loader.className = "loader fadeout";
		document.querySelector('.content').style.opacity = "1";
		setTimeout(function() {
			loader.style.display = "none"
		}, 1000)
	}, 1000)
	// Fonction d'initialisation qui s'exécute lorsque le DOM est chargé
	initMap();
}

const navs = document.querySelectorAll(".side-bar > ul > li");

navs.forEach((nav) => {
	nav.addEventListener("click", (e) => {
		document.querySelector(".nav-tab.active").classList.remove("active");
		nav.classList.add("active");

		// Hide active nav view
		document
			.querySelector('div[data-view-active="true"]')
			.setAttribute("data-view-active", false);

		const nav_view = nav.getAttribute("data-view-name");
		document
			.querySelector(`.${nav_view}`)
			.setAttribute("data-view-active", true);
	});
});