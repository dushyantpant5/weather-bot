const axios = require("axios");

const { dbName } = require("./users.js");

const keys = dbName.collection("api-keys");

const API_KEY = "e665db67868a2a751ae94b55fe190057";

function kelvinToCelcius(temp) {
  return Math.round(temp - 273.15);
}

async function getCurrentWeather(city = "Delhi") {
  const weatherApi = await keys.findOne({ keyType: "weather" });
  const weatherApiKey = await weatherApi.key;
  const apiUrl = `http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}`;
  const response = await axios.get(apiUrl);
  const data = await response.data;

  const currentTemperature = kelvinToCelcius(data.main.temp);
  const currentWeather = data.weather[0].main;

  return { currentTemperature, currentWeather };
}

getCurrentWeather();

module.exports = { getCurrentWeather };
