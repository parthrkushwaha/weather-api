const apiKey = 'fbae68e3b1a982cff5714167a2c5ff3a';
let isCelsius = true;
// Clear history on load and show any existing
document.addEventListener("DOMContentLoaded", () => {
  localStorage.removeItem('weatherHistory');
  loadSearchHistory();
});
// Fetch weather for a city or from input
function getWeather(cityFromHistory) {
  const city = cityFromHistory || document.getElementById('cityInput').value;
  if (!city) return;

  saveSearch(city);
  const units = isCelsius ? 'metric' : 'imperial';
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=${units}`;

  fetch(weatherUrl)
    .then(response => response.json())
    .then(data => {
      if (data.cod !== 200) {
        document.getElementById('weatherResult').innerHTML = 'City not found';
        return;
      }

      updateBackground(data.weather[0].main);
      const unit = isCelsius ? '°C' : '°F';
      const weatherHTML = `
        <h3>${data.name}, ${data.sys.country}</h3>
        <p>${new Date(data.dt * 1000).toLocaleString()}</p>
        <p><img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="weather icon"></p>
        <p><strong>Temperature:</strong> ${data.main.temp} ${unit}</p>
        <p><strong>Weather:</strong> ${data.weather[0].description}</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Wind Speed:</strong> ${data.wind.speed} ${isCelsius ? 'm/s' : 'mph'}</p>
      `;
      document.getElementById('weatherResult').innerHTML = weatherHTML;

      getForecast(data.coord.lat, data.coord.lon);
    })
    .catch(() => {
      document.getElementById('weatherResult').innerHTML = 'Error fetching data';
    });
}
// Get 5-day forecast based on coordinates
function getForecast(lat, lon) {
  const units = isCelsius ? 'metric' : 'imperial';
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;

  fetch(forecastUrl)
    .then(response => response.json())
    .then(data => {
      const daily = data.list.filter(f => f.dt_txt.includes("12:00:00"));
      const forecastHTML = daily.slice(0, 5).map(day => `
        <div class="forecast-card">
          <p>${new Date(day.dt_txt).toLocaleDateString(undefined, { weekday: 'short' })}</p>
          <img src="http://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="weather icon">
          <p>${Math.round(day.main.temp_min)}° / ${Math.round(day.main.temp_max)}°</p>
        </div>
      `).join('');
      document.getElementById('forecast').innerHTML = forecastHTML;
    });
}
// Get weather using geolocation
function getWeatherByLocation() {
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    const units = isCelsius ? 'metric' : 'imperial';
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=${units}`;

    fetch(weatherUrl)
      .then(response => response.json())
      .then(data => {
        document.getElementById('cityInput').value = data.name;
        getWeather(data.name);
      });
  });
}
// Toggle unit and refresh weather if a city is selected
function toggleUnit() {
  isCelsius = !isCelsius;
  const city = document.getElementById('cityInput').value;
  if (city) getWeather(city);
}
// Update background color based on weather condition
function updateBackground(condition) {
  const conditionMap = {
    Clear: '#87ceeb', // sunny
    Clouds: '#b0c4de',
    Rain: '#778899',
    Thunderstorm: '#2f4f4f',
    Snow: '#f0f8ff',
    Mist: '#dcdcdc',
    Drizzle: '#a9a9a9'
  };
  document.body.style.background = conditionMap[condition] || '#2980b9';
}
// Save city search to localStorage
function saveSearch(city) {
  let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
  if (!history.includes(city)) {
    history.unshift(city);
    if (history.length > 5) history.pop();
    localStorage.setItem('weatherHistory', JSON.stringify(history));
    loadSearchHistory();
  }
}
// Display search history as clickable buttons
function loadSearchHistory() {
  let history = JSON.parse(localStorage.getItem('weatherHistory')) || [];
  const historyHTML = history.map(city => `<button onclick="getWeather('${city}')">${city}</button>`).join('');
  document.getElementById('searchHistory').innerHTML = historyHTML;
}