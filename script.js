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
      UVValue = document.getElementById("UVValue"),
      PValue = document.getElementById("PValue"),
      Forecast = document.querySelector(".Forecast");

WEATHER_API_ENDPOINT = 'http://api.openweathermap.org/data/2.5/weather?appid=9daf511b8c199c1bd7acd7ba580588a7&q=';
WEATHER_DATA_ENDPOINT = "http://api.openweathermap.org/data/2.5/onecall?appid=9daf511b8c199c1bd7acd7ba580588a7&exclude=minutely&units=metric&";

function findUserLocation() {
    const city = "London";
    fetch(WEATHER_API_ENDPOINT + city)
    .then(response => response.json())
    .then(data => {
        console.log(data.coord.lng, data.coord.lat);
    })
    .catch(error => console.error('Error fetching weather data:', error));
}

