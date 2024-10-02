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
      PValue = document.getElementById("PValue"),
      VValue = document.getElementById("VValue"),
      Forecast = document.querySelector(".Forecast");

const WEATHER_API_ENDPOINT = 'https://api.openweathermap.org/data/2.5/forecast?appid=9daf511b8c199c1bd7acd7ba580588a7&q=';
const WEATHER_DATA_ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather?appid=9daf511b8c199c1bd7acd7ba580588a7&q=';

let currentTempCelsius;
let currentFeelsLikeCelsius;

function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

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

function getLocationDateTime(timezone_offset) {
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const locationTime = new Date(utcTime + (timezone_offset * 1000));
    
    const dateOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };
    
    const timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    };
    
    const formattedDate = locationTime.toLocaleString("en-US", dateOptions);
    const formattedTime = locationTime.toLocaleString("en-US", timeOptions);
    
    return `<div class="date-line">${formattedDate}</div>
            <div class="time-line">${formattedTime}</div>`;
}

function convertToLocalTime(utcTimestamp, timezone_offset) {
    const date = new Date(utcTimestamp * 1000);
    const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
    return new Date(utcTime + (timezone_offset * 1000));
}

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
        
        date.innerHTML = getLocationDateTime(timezone_offset);
        
        HValue.innerHTML = currentWeather.main.humidity + "%";
        WValue.innerHTML = currentWeather.wind.speed + " m/s";
        
        return fetch(WEATHER_DATA_ENDPOINT + userLocation.value);
    })
    .then((response) => response.json())
    .then((data) => {
        const timezone_offset = data.timezone;
        
        const sunriseLocal = convertToLocalTime(data.sys.sunrise, timezone_offset);
        const sunsetLocal = convertToLocalTime(data.sys.sunset, timezone_offset);
        
        SRValue.innerHTML = sunriseLocal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        SSValue.innerHTML = sunsetLocal.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        CValue.innerHTML = data.clouds.all + "%";
        PValue.innerHTML = data.main.pressure + " hPa";
        VValue.innerHTML = `${(data.visibility / 1000).toFixed(1)} km`;

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

function displayWeeklyForecast(forecastData) {
    Forecast.innerHTML = '';
    const timezone_offset = forecastData.city.timezone;
    const dailyData = groupForecastByDay(forecastData.list, timezone_offset);
    
    dailyData.slice(0, 6).forEach(day => {
        const dayElement = document.createElement("div");
        dayElement.classList.add("day-forecast");

        const forecastDate = convertToLocalTime(day[0].dt, timezone_offset);
        const dayName = forecastDate.toLocaleDateString("en-US", { weekday: 'short' });
        const date = forecastDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });

        const icon = day[0].weather[0].icon;
        const description = day[0].weather[0].description;
        const maxTemp = Math.max(...day.map(d => d.main.temp)) - 273.15;
        const minTemp = Math.min(...day.map(d => d.main.temp)) - 273.15;

        const isDayTime = icon.includes('d');
        const iconURL = `https://openweathermap.org/img/wn/${icon}${isDayTime ? '' : '@2x'}.png`;

        dayElement.innerHTML = `
            <div class="forecast-day">
                <span>${dayName}</span>
                <span>${date}</span>
            </div>
            <img src="${iconURL}" alt="${description}">
            <div class="forecast-description">${description}</div>
            <div class="forecast-temp">
                <span><i class="fa-solid fa-temperature-high"></i> Max: ${Math.round(maxTemp)}°C</span>
                <br>
                <span><i class="fa-solid fa-temperature-low"></i> Min: ${Math.round(minTemp)}°C</span>
            </div>
        `;

        Forecast.appendChild(dayElement);
    });
}

// Fixed groupForecastByDay function
function groupForecastByDay(forecastList, timezone_offset) {
    const days = {};
    forecastList.forEach((forecast) => {
        const localDate = convertToLocalTime(forecast.dt, timezone_offset)
            .toLocaleDateString("en-US");
        if (!days[localDate]) {
            days[localDate] = [];
        }
        days[localDate].push(forecast);
    });

    return Object.values(days);
}

userLocation.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        findUserLocation();
    }
});

converter.addEventListener("change", () => {
    const selectedUnit = converter.value;
    updateTemperatureDisplay(selectedUnit);
});