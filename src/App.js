import React, { useState, useEffect } from "react";
import "./styles.css";

const API_KEY = "ce7eadb2b1362495de9530a6a20adc3c";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      )
        .then((res) => res.json())
        .then((data) => {
          setWeather(data);
          setCity(data.name);
        });
    });
  }, []);

  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("favorites")) || [];
    const hist = JSON.parse(localStorage.getItem("history")) || [];
    setFavorites(favs);
    setHistory(hist);
  }, []);

  useEffect(() => {
    if (!weather) return;
    const severe = ["Thunderstorm", "Snow"];
    if (severe.includes(weather.weather[0].main)) {
      alert(`⚠️ Внимание: ${weather.weather[0].description}`);
    }
  }, [weather]);

  const getWeather = async () => {
    if (!city) return;
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error("City not found");

      const data = await res.json();
      setWeather(data);
      setError("");

      const newHistory = [
        data.name,
        ...history.filter((c) => c !== data.name),
      ].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem("history", JSON.stringify(newHistory));
    } catch (err) {
      setWeather(null);
      setError(err.message);
    }
  };

  const toggleFavorite = () => {
    if (!city) return;
    let newFavs = [...favorites];
    if (favorites.includes(city)) {
      newFavs = newFavs.filter((c) => c !== city);
    } else {
      newFavs.push(city);
    }
    setFavorites(newFavs);
    localStorage.setItem("favorites", JSON.stringify(newFavs));
  };

  const isFavorite = (city) => favorites.includes(city);

  const getThemeClass = () => {
    if (!weather) return "";
    const condition = weather.weather[0].main.toLowerCase();
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 18;
    return `${condition} ${isNight ? "night" : "day"}`;
  };

  return (
    <div className={`app ${getThemeClass()} ${darkMode ? "dark" : "light"}`}>
      <h1>Weather App 🌦️</h1>

      <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      <div className="search">
        <input
          type="text"
          placeholder="Enter city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={getWeather}>Search</button>
      </div>

      {error && <p className="error">{error}</p>}

      {history.length > 0 && (
        <div className="history">
          <h4>Search History</h4>
          {history.map((item) => (
            <button key={item} onClick={() => setCity(item)}>
              {item}
            </button>
          ))}
        </div>
      )}

      {favorites.length > 0 && (
        <div className="favorites">
          <h4>⭐ Favorites</h4>
          {favorites.map((fav) => (
            <button key={fav} onClick={() => setCity(fav)}>
              {fav}
            </button>
          ))}
        </div>
      )}

      {weather && (
        <div className="weather">
          <h2>
            {weather.name}, {weather.sys.country}{" "}
            <button className="fav-btn" onClick={toggleFavorite}>
              {isFavorite(weather.name) ? "★" : "☆"}
            </button>
          </h2>
          <p>{weather.weather[0].main}</p>
          <p>{Math.round(weather.main.temp)}°C</p>
          <p>
            Local time:{" "}
            {new Date((weather.dt + weather.timezone) * 1000)
              .toUTCString()
              .slice(-12, -4)}
          </p>
          <img
            src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
            alt={weather.weather[0].description}
          />
        </div>
      )}
    </div>
  );
}

export default App;
