// DOM Project2b, Javascript course, Laurea UAS, Commenting starts here.
// In this one jQuery and fetch is used.
// First we wait for the page to load, then we declare some variables.
// Event listener for listening the page to load and general variables are declared here beneath.

$(window).on('load', () => {
	let API_KEY = '71999687a3a8645a511abce5465479b5';
	let locationApiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=`;
	let weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?`;
	let forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast?';
	let units = 'metric';
	let input = $('#input');
	let weatherForCurrentLocation = $('#currentLocation');
	let pLocation = $('#location p');
	let latitude = '';
	let longitude = '';
	let forecastList = $('#forecastList');
	let check24 = $('#check24');
	let check72 = $('#check72');
	let forecast24 = false;
	let forecast72 = false;

	// Event listener for the current location finder
	weatherForCurrentLocation.on('click', geoFindMe);

	// Event listener for the form submit
	// Also validation for the input form
	input.on('submit', (e) => {
		e.preventDefault();
		let city = e.target.elements.city.value;

		if (city !== '') {
			checkLocation(city);
			$(input)[0].reset();
		} else {
			alert("City input can't be empty!");
			console.log("Error! City input can't be empty!");
			return;
		}
	});

	// Event listeners for the forecast buttons
	// Animation done with jQuery library
	check24.on('click', (e) => {
		checkForecast(latitude, longitude);
		forecast24 = true;
		forecast72 = false;
		$(check24).animate(
			{
				fontSize: '0.9rem',
			},
			'slow'
		);
		$(check72).animate(
			{
				fontSize: '0.8rem',
			},
			'slow'
		);
	});

	check72.on('click', (e) => {
		checkForecast(latitude, longitude);
		forecast72 = true;
		forecast24 = false;
		$(check72).animate(
			{
				fontSize: '0.9rem',
			},
			'slow'
		);
		$(check24).animate(
			{
				fontSize: '0.8rem',
			},
			'slow'
		);
	});

	// Function geoFindme for looking up the location of the browser and storing the latitude and longitude values for later use.
	// Some animation done with jQuery library
	function geoFindMe() {
		$('#weather').fadeToggle(150);
		$('#forecast').fadeToggle(150);
		function success(position) {
			latitude = position.coords.latitude;
			longitude = position.coords.longitude;
			pLocation.html(
				`Latitude: ${latitude}° <br> Longitude: ${longitude} °`
			);
			checkCurrentWeather(latitude, longitude); // As a default checking the current weather with the coordinates from current location right away
			hideForecast(); // Hiding forecast, as a default showing only current weather
			clearForecast(); // Clearing forecast of any old locations
		}
		// Default error message, if-else conditional with a timeout for the position lookup
		function error() {
			pLocation.text('Unable to retrieve your location');
		}

		if (!navigator.geolocation) {
			pLocation.text('Geolocation is not supported by your browser');
		} else {
			pLocation.text('Locating…');
			navigator.geolocation.getCurrentPosition(success, error, {
				timeout: 5000,
			});
		}
	}

	// checkLocation function to check a city from user input
	// The data is requested with the Fetch API function
	// Some animation done with jQuery library
	function checkLocation(city) {
		$('#weather').fadeToggle(150);
		$('#forecast').fadeToggle(150);
		fetch(`${locationApiUrl}${city}&limit=1&appid=${API_KEY}`)
			.then((locationResponse) => locationResponse.json())
			.then((locationData) => {
				if (locationData == '') {
					// Checking if the response was empty, this means that the response did not find coordinates for the user input
					alert('Did not find that city. Please try again!'); // Pop up an alert
					pLocation.html('No Coordinates'); // Reset location coordinates
					clearForecast(); // Clear forecast section
					hideForecast(); // Hide forecast section
					clearCurrent(); // Clear current weather section
				} else {
					getLocationInfo(locationData); // If the city was found then we will store the response and run this function
				}
			});
	}

	// Function getLocationInfo to get the coordinates for the user input city
	// Latitude and longitude values are found in the JSON response
	// They are stored in variables lat and lon
	function getLocationInfo(locationData) {
		latitude = locationData[0].lat;
		longitude = locationData[0].lon;

		const str = ` Latitude: ${latitude} ° <br> Longitude: ${longitude} °`; // Here we print out the location coordinates to the app location section

		pLocation.html(str);
		checkCurrentWeather(latitude, longitude); // Search for current location's current weather
		clearForecast(); // Clear forecast section
		hideForecast(); // Hide forecast section
	}

	// Function checkCurrentWeather to search for the current weather
	// The data is requested with the Fetch API function
	// Here we pass in the latitude and longitude values from either the geoFindMe or the checkLocation function
	function checkCurrentWeather(latitude, longitude) {
		$('#weather').hide(100);
		$('#forecast').hide(100);
		$('#weather').fadeToggle(330);
		$('#forecast').fadeToggle(330);
		let pWeather = $('#weatherData'); // Place for storing the weather info from loading to ready state
		fetch(
			`${weatherApiUrl}lat=${latitude}&lon=${longitude}&units=${units}&appid=${API_KEY}&units=${units}`
		)
			.then((currentWeatherResponse) => currentWeatherResponse.json())
			.then((currentWeatherData) => {
				// Storing the data and sending it to the function createCurrentWeatherInfo
				createCurrentWeatherInfo(currentWeatherData, pWeather);
			});
	}

	// Function for creating the information to the html page, temp, wind, sunrise, sunset etc passed on and showed on the page.
	function createCurrentWeatherInfo(currentWeatherData, pWeather) {
		let nWeather = $('#cityName'); // Place for storing the weather station name to the html document
		let iWeather = $('#weatherIcon'); // Place for the weather icon
		let tWeather = $('#temp'); // Place for the current temp beside the icon
		// Declaring variables for weather info and using function to format time as wanted and wind direction degree to compass directions
		// First the timeFormat constant for formatting the time for the weather
		const timeFormat = (date) =>
			date.toLocaleString('en-gb', {
				month: 'short',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
			});
		const location = currentWeatherData.name; // Weather station name
		const temp = currentWeatherData.main.temp.toFixed(0); // Weather temperature
		const wind = currentWeatherData.wind.speed.toFixed(0); // Wind speed
		const time = timeFormat(new Date(currentWeatherData.dt * 1000)); // Current time
		const icon = currentWeatherData.weather[0].icon; // Weather icon
		const description = currentWeatherData.weather[0].description; // Weather description
		const num = degToCompass(currentWeatherData.wind.deg); // Wind direction, using the degToCompass function for converting degree to compass directions
		const feels = currentWeatherData.main.feels_like.toFixed(0); // Feels like-temperature
		// Sunrise & Sunset for the current weather from the API
		const sunrise = new Date(
			currentWeatherData.sys.sunrise * 1000
		).toLocaleString('en-gb', {
			hour: '2-digit',
			minute: '2-digit',
		});
		const sunset = new Date(
			currentWeatherData.sys.sunset * 1000
		).toLocaleString('en-gb', {
			hour: '2-digit',
			minute: '2-digit',
		});

		// After looking up the weather info it is put into HTML
		// First declaring variables with the information and after that taking it into HTML

		const str = `${time} <br> ${description} <br> Feels like: ${feels} °C <br> Wind: ${wind} m/s from ${num} <br> Sunrise: ${sunrise} <br> Sunset: ${sunset}`;

		const name = `${location}`;

		tWeather.html(`${temp} °C`);

		iWeather.html(
			`<img src="https://openweathermap.org/img/wn/${icon}@4x.png" alt="${description}" height="120px">`
		);

		nWeather.html(name);

		pWeather.html(str);
	}

	// Function checkForecast requests data from API about the forecast information
	// The data is requested with the Fetch API function
	// Inside this function we check if user pressed 24h or 24-72h option for the forecast
	function checkForecast(latitude, longitude) {
		showForecast(); // Call the function to show the forecast
		$('#forecastList').fadeToggle(100);
		$('#forecastList').hide(100);
		$('#forecastList').fadeToggle(200);
		fetch(
			`${forecastApiUrl}lat=${latitude}&lon=${longitude}&units=${units}&appid=${API_KEY}&units=${units}`
		)
			.then((forecastResponse) => forecastResponse.json())
			.then((forecastData) => {
				if (forecast24 == true) {
					createForecast24Info(forecastData); // Here the next 24h version of forecast is deployed by calling the createForecast24info function
				}
				if (forecast72 == true) {
					createForecast72Info(forecastData); // Here the 24-72h version of forecast is deployed createForecast72info function
				}
			});
	}

	// Function to construct the 24 hour forecast
	//  Here we lookup the forecast element and gather the data package for it
	// For loop is used to look up next 24h with a 3h interval and inserting it to the HTML element

	function createForecast24Info(forecastData) {
		let forecastFor24 = '<ul> <h3> Forecast for the next 24h</h3>';

		// For loop for the weather information between 3h intervals
		for (i = 0; i <= 8; i++) {
			forecastFor24 += ` <li> <div><div class="forecastImg"> <img src="https://openweathermap.org/img/wn/${
				forecastData.list[i].weather[0].icon
			}@4x.png" alt="${
				forecastData.list[i].weather[0].description
			}" height="40px"></div>${new Date(
				forecastData.list[i].dt * 1000
			).toLocaleString('en-gb', {
				month: 'short',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
			})} Temperature: ${forecastData.list[i].main.temp.toFixed(
				0
			)} °C <br> Wind: ${forecastData.list[i].wind.speed.toFixed(
				0
			)} m/s from ${degToCompass(forecastData.list[i].wind.deg)}</div>
			  </li>`;
		}
		forecastFor24 += '</ul>';

		forecastList.html(forecastFor24); // Command to insert the created object into the html
	}

	// This function constructs the weather forecast for the hours between the hour from 24 to 72 hour
	// Here we lookup the forecast HTML element and gather the data package for it
	// For loop is used to look up next 24h with a 3h interval and inserting it to the html
	function createForecast72Info(forecastData) {
		let forecastFor72 =
			'<ul> <h3> Forecast from the next 24h to 72h </h3> ';

		// For loop for the weather information between 6h intervals
		for (i = 7; i <= 24; i += 2) {
			forecastFor72 += ` <li> <div><div class="forecastImg"> <img src="https://openweathermap.org/img/wn/${
				forecastData.list[i].weather[0].icon
			}@4x.png" alt="${
				forecastData.list[i].weather[0].description
			}" height="40px"></div>${new Date(
				forecastData.list[i].dt * 1000
			).toLocaleString('en-gb', {
				month: 'short',
				day: '2-digit',
				hour: '2-digit',
				minute: '2-digit',
			})} Temperature: ${forecastData.list[i].main.temp.toFixed(
				0
			)} °C  <br> Wind: ${forecastData.list[i].wind.speed.toFixed(
				0
			)} m/s from ${degToCompass(forecastData.list[i].wind.deg)}</div>
			  </li>`;
		}
		forecastFor72 += '</ul>';

		forecastList.html(forecastFor72); // Command to insert the created object into the html
	}

	// Function for converting degree values to compass directions
	function degToCompass(num) {
		var val = Math.floor(num / 22.5 + 0.5);
		var arr = [
			'North',
			'North NE',
			'North E',
			'East NE',
			'East',
			'Eeast SE',
			'South E',
			'South SE',
			'South',
			'South SW',
			'South W',
			'West SW',
			'West',
			'West NW',
			'North W',
			'North NW',
		];
		return arr[val % 16];
	}
	// Function to clear the current weather when a new user input or an error happens
	function clearCurrent() {
		let currentWeatherInfo = $('#weather');

		currentWeatherInfo.html(`<div class="current">
                    <div>
                        <p id="temp" class="temp"></p>
                    </div>
                    <div id="weatherIcon"><img src="" alt=""></div>
                </div>
                <div id="weatherInfo">
                    <h3>Weather station details</h3>
                    <p id="cityName">No City Data</p>
                    <p id="weatherData">No Weather Data</p>
                </div>`);
	}
	// Function to clear the Forecast when a new location is searched
	function clearForecast() {
		let forecastList = $('#forecastList');
		forecastList.html('');
	}
	// Function to show the Forecast, done with adding classlists that will show the div with the forecast
	function showForecast() {
		$('#right').fadeIn(250);
		let container = $('#container');
		container.addClass('forecastWidth');
		container.addClass('forecastMinWidth');
	}
	// Function to hide the Forecast, done with removing the classlists that show the forecast
	function hideForecast() {
		$('#right').fadeOut(175);
		let container = $('#container');
		container.removeClass('forecastWidth');
		container.removeClass('forecastMinWidth');
		$(check24).animate(
			{
				fontSize: '0.8rem',
			},
			'slow'
		);
		$(check72).animate(
			{
				fontSize: '0.8rem',
			},
			'slow'
		);
	}
});
