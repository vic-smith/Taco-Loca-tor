/* TACO LOCATOR JAVASCRIPT */

/* GLOBAL VARIABLES START */

let tacos = [
	"assets/images/taco1.jpg",
	"assets/images/taco2.jpg",
	"assets/images/taco3.jpg",
	"assets/images/taco4.jpg",
	"assets/images/taco5.jpg",
	"assets/images/taco6.jpg",
	"assets/images/taco7.jpg",
	"assets/images/taco8.jpg",
	"assets/images/taco9.jpg",
	"assets/images/taco10.jpg",
	"assets/images/taco11.jpg",
	"assets/images/taco12.jpg",
	"assets/images/taco13.jpg",
	"assets/images/taco14.jpg",
	"assets/images/taco15.jpg",
	"assets/images/taco16.jpg",
	"assets/images/taco17.jpg",
	"assets/images/taco18.jpg",
	"assets/images/taco19.jpg",
	"assets/images/taco20.jpg",
];

const RANGE = 20;
const NUM_RESULTS = 30;
const NUM_SEARCH_HISTORY = 8;
let savedSearches = [];

// HTML Elements
let tacoSearchFormEl = document.querySelector("#tacoSearchForm");
let searchInputEl = document.querySelector("#input");
let searchHistoryDropdownEl = document.querySelector("#searchDropdown");

// This flag designates whether using local test data or burning an API call
let useDocumenuTestData = true;
let useMapQuestTestData = true;

/* GLOBAL VARIABLES END
/* EVENT HANDLERS START */

// Handle Searches
let searchSubmitHandler = (event) => {
	event.preventDefault();

	// Get the user input
	let location = searchInputEl.value.trim();

	// Validate user input
	if (location) {
		// If valid, continue
		getSearchCoords(location);
	} else {
		// In invalid, inform user
		searchInputEl.setAttribute("placeholder", "PLEASE ENTER A LOCATION TO SEARCH FOR YUMMY TACOS");
	}
};
// Create Event Listener for search form
tacoSearchFormEl.addEventListener("submit", searchSubmitHandler);

// Handle Search History
let historyClickHandler = (event) => {
	// Get the location from the search history item and continue
	let location = event.target.getAttribute("data-search");
	getSearchCoords(location);
};
// Create Event Listener for search history clicks
searchHistoryDropdownEl.addEventListener("click", historyClickHandler);

/* EVENT HANDLERS END */
/* MAIN FUNCTIONS START */

// Function to create static map from MapQuest API and put in HTML. Takes in restaurant results array from Documenu.
let createMap = (data) => {
	// If testing
	if (useMapQuestTestData) {
		staticMapAPI = "./assets/images/Test Data Map";
	} else {
		// If not testing

		let staticMapAPI;
		// Create a string for locations query parameter of MapQuest API from Documenu results JSON
		let locString = "";

		// Loop through restaurants and append their lat and long to the locations query parameter
		for (let i = 0; i < data.length; i++) {
			locString = locString.concat(data[i].geo.lat, ",", data[i].geo.lon);
			console.log(locString);
			if (i < data.length - 1) {
				locString = locString.concat("||");
				console.log(locString);
			}
		}

		// MapQuest Static Map API string
		staticMapAPI = `https://open.mapquestapi.com/staticmap/v5/map?locations=${locString}&defaultMarker=marker-sm-num&size=@2x&key=pmTncUmE4WZvotxffzMXoDh0tdUGP9Vc`;
	}

	// Add static map api string to HTML img tag
	mapImgEl = document.querySelector("#map");
	mapImgEl.setAttribute("src", staticMapAPI);
	mapImgEl.setAttribute("alt", "Map of taco locations near");
	//TODO Error handling for API errors
};

// Create and display result cards
let createCards = (data) => {
	console.log("I got this far", data);
	// for loop to create 5 cards
	for (let i = 0; i < 5; i++) {
		let rName = data[i].restaurant_name;
		let pRange = data[i].price_range;

		// create a card
		var newEl = document.createElement("a1");
		newEl.classList = "card";
		document.getElementById("card-container").appendChild(newEl);
		// create a span element to hold restaurant name
		let resName = document.createElement("span");
		resName.classList = "form-cards";
		resName.textContent = rName;

		//console.log(restaurant_name)
		// append to card
		newEl.appendChild(resName);

		let price = document.createElement("span");
		price.textContent = pRange;
		//console.log(price_range);
		newEl.appendChild(price);

		//create image element

		let img = document.createElement("img");
		//const random = Math.floor(Math.random()* tacos.length);
		//img.src = tacos[random]
		img.src = tacos[0];
		tacos.shift();

		img.classList = "image";
		//console.log(price_range);
		newEl.appendChild(img);
	}
};

// Documenu API call
let getTacoSpots = (lat, lng) => {
	// If testing
	if (useDocumenuTestData) {
		createMap(testData);
		createCards(testData);
		console.log(testData);
	} else {
		// If not testing
		let documenuAPI = `https://documenu.p.rapidapi.com/restaurants/search/geo?lat=${lat}&lon=${lng}&distance=${RANGE}&size=${NUM_RESULTS}&page=2&fullmenu=true&cuisine=Mexican`;
		// API Call
		fetch(documenuAPI, {
			method: "GET",
			headers: {

				// "a7687a16eb8ef8a7cc7fce5518caad34" is burned. Should be ready by 10/15
				"x-api-key": "4e6e62be3a4e1bd49904f6b7765e208b",

				// "x-api-key": "a7687a16eb8ef8a7cc7fce5518caad34" is burned. Should be ready by 10/15
				//"x-api-key": "0d2c61c6b7a6aa25b5a19d6563af21ca",

				"x-rapidapi-host": "documenu.p.rapidapi.com",
				"x-rapidapi-key": "ef5d4d8b3amshd77a5cbfa217b59p18252bjsn98a33ecd6cc4",
			},
		})
			.then((response) => {
				if (response.ok) {
					response.json().then((data) => {
						// Create map from the returned data
						createMap(data.data);
						createCards(data.data);
						console.log("You burned an API call!");
						console.log(data.data);
					});
				}
			})
			.catch((err) => {
				console.error(err);
			});
	}
};

// Save search history
let saveSearch = (locationStr) => {
	// Add location to the saved searches array
	savedSearches.unshift(locationStr);
	// Create a set so there aren't duplicates
	savedSearches = [...new Set(savedSearches)];

	// Drop off the oldest searches
	while (savedSearches > NUM_SEARCH_HISTORY) {
		savedSearches.pop;
	}

	// Update UI
	updateSearchHistoryElements();

	// Update localStorage
	localStorage.setItem("tacoSearches", JSON.stringify(savedSearches));
};

// Make nested API calls to get weather data
let getSearchCoords = (loc) => {
	// Clear value from input field
	searchInputEl.value = "";

	if (useMapQuestTestData) {
		// If testing
		// Warning about fake data
		alert("This is currently only pulling internal test data an not using an API call (those are expensive).");

		// Nothing to send to Documenu API
		getTacoSpots("", "");
		// Add new location to search history
		saveSearch(loc);
	} else {
		// If not testing
		let latLngSearchApiUrl = `https://open.mapquestapi.com/geocoding/v1/address?key=pmTncUmE4WZvotxffzMXoDh0tdUGP9Vc&location=${loc}`;
		// API call to Mapquest to get latitude and longitude from generic place name
		fetch(latLngSearchApiUrl)
			.then((resp1) => {
				if (resp1.ok) {
					resp1.json().then((geoData) => {
						// Extract data from first result
						console.log(geoData);
						let lat = geoData.results[0].locations[0].latLng.lat;
						let lng = geoData.results[0].locations[0].latLng.lng;
						let city = geoData.results[0].locations[0].adminArea5;
						let state = geoData.results[0].locations[0].adminArea3;

						// Check that destination is specific enough to return a city, state and country identifier
						if (!city || !state) {
							// TODO: Get rid of alert and display something in the page
							alert("Your search may be too broad. Please enter more specific location information for results.");
						} else {
							// Create a city, state, country string for display and search history purposes
							let locationStr = `${city}, ${state}`;

							// Send latitude and longitude to Documenu API call
							getTacoSpots(lat, lng);

							// Add location to search history
							saveSearch(locationStr);
						}
					});
				}
			})
			.catch((error) => {
				console.log(error);
				// TODO: Move this alert to show in the card display div
				alert(
					"There was an issue with getting your information. The data service might be down. Please check your internet connection and try again in a few minutes."
				);
			});
	}
};

// Update Search History UI
let updateSearchHistoryElements = () => {
	// Clear previous search items
	searchHistoryDropdownEl.innerHTML = "";

	// Loop over searchSavedSearches
	for (let item in savedSearches) {
		// Make the search button
		let searchButton = document.createElement("button");
		searchButton.setAttribute("class", "pure-menu-link");
		searchButton.setAttribute("data-search", savedSearches[item]);
		searchButton.innerHTML = savedSearches[item];

		// Make list item
		let listItem = document.createElement("li");
		listItem.setAttribute("class", "pure-menu-item");

		// Add list item to dropdown menu
		listItem.appendChild(searchButton);
		searchHistoryDropdownEl.appendChild(listItem);
	}
};

// If there are searches in local storage, pull them into savedSearches
let loadLocalStorage = () => {
	// Check localStorage and add to
	let storedSearches = localStorage.getItem("tacoSearches");
	if (storedSearches) {
		savedSearches = JSON.parse(storedSearches);
	}
	updateSearchHistoryElements();
};

/* MAIN FUNCTIONS END */

// initial page load
loadLocalStorage();
