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

const WEATHER_API_ENDPOINT = 'http://api.openweathermap.org/data/2.5/forecast?appid=9daf511b8c199c1bd7acd7ba580588a7&q=';
const WEATHER_DATA_ENDPOINT = 'http://api.openweathermap.org/data/2.5/weather?appid=9daf511b8c199c1bd7acd7ba580588a7&q=';

let isCelsius = true;
let currentTempCelsius;
let currentFeelsLikeCelsius;

function celsiusToFahrenheit(celsius) {
    return (celsius * 9/5) + 32;
}

function updateTemperatureDisplay() {
    if (currentTempCelsius === undefined || currentFeelsLikeCelsius === undefined) {
        console.error("Temperature data not available");
        return;
    }

    if (isCelsius) {
        temperature.innerHTML = Math.round(currentTempCelsius) + "°C";
        feelsLike.innerHTML = "Feels like: " + Math.round(currentFeelsLikeCelsius) + "°C";
    } else {
        const tempF = celsiusToFahrenheit(currentTempCelsius);
        const feelsLikeF = celsiusToFahrenheit(currentFeelsLikeCelsius);
        temperature.innerHTML = Math.round(tempF) + "°F";
        feelsLike.innerHTML = "Feels like: " + Math.round(feelsLikeF) + "°F";
    }
}

function toggleTemperatureUnit() {
    isCelsius = !isCelsius;
    updateTemperatureDisplay();
    updateConverterButtonText();
}

function updateConverterButtonText() {
    converter.innerHTML = `
        <span class="${isCelsius ? 'active' : ''}">&deg;C</span>
        |
        <span class="${!isCelsius ? 'active' : ''}">&deg;F</span>
    `;
}


function findUserLocation() {
    fetch(WEATHER_API_ENDPOINT + userLocation.value)
    .then((response) => response.json())
    .then((data) => { 
        if(data.cod != "200"){
            alert(data.message);
            return;
        }
        console.log(data);
        city.innerHTML = data.city.name + "," + data.city.country;
        
        let currentWeather = data.list[0];
        weatherIcon.style.backgroundImage = `url(https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png)`;
        
        currentTempCelsius = currentWeather.main.temp - 273.15;
        currentFeelsLikeCelsius = currentWeather.main.feels_like - 273.15;
        updateTemperatureDisplay();
        
        description.innerHTML = '<i class="fa-brands fa-cloudversify"></i> &nbsp;' +currentWeather.weather[0].description;
        let dateObj = new Date(currentWeather.dt * 1000);
        date.innerHTML = dateObj.toLocaleDateString();
        
        HValue.innerHTML = currentWeather.main.humidity + "%";
        WValue.innerHTML = currentWeather.wind.speed + " m/s";
        
        // Fetch additional weather data
        return fetch(WEATHER_DATA_ENDPOINT + userLocation.value);
    })
    .then((response) => response.json())
    .then((data) => {
        console.log(data);
        let sunriseTime = new Date(data.sys.sunrise * 1000).toLocaleTimeString();
        let sunsetTime = new Date(data.sys.sunset * 1000).toLocaleTimeString();
        SRValue.innerHTML = sunriseTime;
        SSValue.innerHTML = sunsetTime;
        
        CValue.innerHTML = data.clouds.all + "%";
        PValue.innerHTML = data.main.pressure + " hPa";
        
        VValue.innerHTML = `${(data.visibility / 1000).toFixed(1)} km`;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while fetching the weather data.');
    });
}

// Add event listeners
userLocation.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        findUserLocation();
    }
});
converter.addEventListener("click", toggleTemperatureUnit);
