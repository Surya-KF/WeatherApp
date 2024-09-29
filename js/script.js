const userLocation = document.getElementById("userLocation"),
      converter = document.getElementById("converter"),
      weatherIcon = document.querySelector(".weatherIcon"),
      temperature = document.querySelector(".temperature"),
      feelsLike = document.querySelector(".feelsLike"),
      description = document.querySelector(".description"),
      date = document.querySelector(".date"),
      city = document.querySelector(".city"),
      HValue = document.getElementById("HValue"),
      WValue = document.getElementById("WValue"),
      SRValue = document.getElementById("SRValue"),
      SSValue = document.getElementById("SSValue"),
      CValue = document.getElementById("CValue"),
      VValue = document.getElementById("VValue"),
      PValue = document.getElementById("PValue"),
      Forecast = document.querySelector(".Forecast");

const WEATHER_API_ENDPOINT = 'https://api.openweathermap.org/data/2.5/forecast?appid=9daf511b8c199c1bd7acd7ba580588a7&q=';
const WEATHER_DATA_ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather?appid=9daf511b8c199c1bd7acd7ba580588a7&q=';

let currentTempCelsius;
let currentFeelsLikeCelsius;

// Function to convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

// Function to update the temperature display based on selected unit
function updateTemperatureDisplay(unit) {
    if (currentTempCelsius === undefined || currentFeelsLikeCelsius === undefined) {
        console.error("Temperature data not available");
        return;
    }

    if (unit === 'C') {
        temperature.innerHTML = Math.round(currentTempCelsius) + "°C";
        feelsLike.innerHTML = "Feels like: " + Math.round(currentFeelsLikeCelsius) + "°C";
    } else {
        const tempF = celsiusToFahrenheit(currentTempCelsius);
        const feelsLikeF = celsiusToFahrenheit(currentFeelsLikeCelsius);
        temperature.innerHTML = Math.round(tempF) + "°F";
        feelsLike.innerHTML = "Feels like: " + Math.round(feelsLikeF) + "°F";
    }
}

// Function to find the user location and fetch weather data
function findUserLocation() {
    fetch(WEATHER_API_ENDPOINT + userLocation.value)
    .then((response) => response.json())
    .then((data) => { 
        if (data.cod !== "200") {
            alert(data.message);
            return;
        }
        
        city.innerHTML = data.city.name + ", " + data.city.country;
        
        let currentWeather = data.list[0];
        let timezone_offset = data.city.timezone;

        weatherIcon.style.backgroundImage = `url(https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png)`;
        
        currentTempCelsius = currentWeather.main.temp - 273.15;
        currentFeelsLikeCelsius = currentWeather.main.feels_like - 273.15;

        const selectedUnit = converter.value;
        updateTemperatureDisplay(selectedUnit);
        
        description.innerHTML = '<i class="fa-brands fa-cloudversify"></i> &nbsp;' + currentWeather.weather[0].description;
        
        const options = {
            weekday: "long",
            month: "long",
            day: "numeric",
            minute: "numeric",
            hour: "numeric"
        };
        date.innerHTML = getLongFormatDateTime(currentWeather.dt, timezone_offset, options);
        
        HValue.innerHTML = currentWeather.main.humidity + "%";
        WValue.innerHTML = currentWeather.wind.speed + " m/s";
        
        // Fetch additional weather data
        return fetch(WEATHER_DATA_ENDPOINT + userLocation.value);
    })
    .then((response) => response.json())
    .then((data) => {
        let sunriseTime = new Date((data.sys.sunrise + data.timezone) * 1000).toLocaleTimeString(); // Adjust for timezone
        let sunsetTime = new Date((data.sys.sunset + data.timezone) * 1000).toLocaleTimeString(); // Adjust for timezone
        SRValue.innerHTML = sunriseTime;
        SSValue.innerHTML = sunsetTime;
        
        CValue.innerHTML = data.clouds.all + "%";
        PValue.innerHTML = data.main.pressure + " hPa";
        VValue.innerHTML = `${(data.visibility / 1000).toFixed(1)} km`;

        // Fetch forecast data for the week
        return fetch(WEATHER_API_ENDPOINT + userLocation.value);
    })
    .then((response) => response.json())
    .then((forecastData) => {
        displayWeeklyForecast(forecastData);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while fetching the weather data.');
    });
}

// Function to display the weekly forecast
function displayWeeklyForecast(forecastData) {
    Forecast.innerHTML = ''; // Clear previous forecast
    const dailyData = groupForecastByDay(forecastData.list);

    dailyData.slice(0, 6).forEach(day => {
        const dayElement = document.createElement("div");
        dayElement.classList.add("day-forecast");

        const forecastDate = new Date(day[0].dt * 1000);
        const dayName = forecastDate.toLocaleDateString("en-US", { weekday: 'short' });
        const date = forecastDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
        
        const icon = day[0].weather[0].icon;
        const description = day[0].weather[0].description;
        const maxTemp = Math.max(...day.map(d => d.main.temp)) - 273.15;
        const minTemp = Math.min(...day.map(d => d.main.temp)) - 273.15;

        dayElement.innerHTML = `
            <div class="forecast-day">
                <span>${dayName}</span>
                <span>${date}</span>
            </div>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${description}">
            <div class="forecast-description">${description}</div>
            <div class="forecast-temp">
                <span> <i class="fa-solid fa-temperature-high"></i>Max: ${Math.round(maxTemp)}°C</span>
                <br>
                <span><i class="fa-solid fa-temperature-low"></i> Min: ${Math.round(minTemp)}°C</span>
            </div>
        `;

        Forecast.appendChild(dayElement);
    });
}


// Group forecast data by day
function groupForecastByDay(forecastList) {
    const days = {};
    forecastList.forEach((forecast) => {
        const date = new Date(forecast.dt * 1000).toLocaleDateString("en-US");
        if (!days[date]) {
            days[date] = [];
        }
        days[date].push(forecast);
    });

    return Object.values(days);
}

// Add event listeners
userLocation.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        findUserLocation();
    }
});

// Update temperature display when the converter changes
converter.addEventListener("change", (event) => {
    updateTemperatureDisplay(event.target.value);
});

// Function to format date/time with timezone offset
function getLongFormatDateTime(unixTimestamp, timezoneOffset, options) {
    let date = new Date((unixTimestamp + timezoneOffset) * 1000); // Adjust for timezone
    return date.toLocaleString("en-US", options); // Apply any options for formatting
}
