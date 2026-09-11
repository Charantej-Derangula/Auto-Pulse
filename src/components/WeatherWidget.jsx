import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function WeatherWidget() {
  const { weather, isWeatherLoading, refreshWeather, weatherError } = useApp();

  const handleRefresh = (e) => {
    e.stopPropagation();
    refreshWeather(true);
  };

  const safeCondition = weather?.condition || 'Sunny';
  const conditionKey = safeCondition.toLowerCase();

  return (
    <div 
      className={`weather-badge weather-${conditionKey} ${isWeatherLoading ? 'loading' : ''}`}
      onClick={handleRefresh}
      title={isWeatherLoading ? 'Fetching live weather...' : `${safeCondition} in ${weather?.city || 'Local Area'} • Click to refresh live weather telemetry`}
      style={{ cursor: 'pointer' }}
    >
      <div className="weather-icon-wrap">
        {safeCondition === 'Sunny' && (
          <div className="sun-icon">
            <span className="sun-core"></span>
            <span className="sun-rays"></span>
          </div>
        )}
        {safeCondition === 'Cloudy' && (
          <div className="cloud-icon">
            <span className="cloud-bubble back"></span>
            <span className="cloud-bubble front"></span>
          </div>
        )}
        {safeCondition === 'Rainy' && (
          <div className="rain-icon">
            <span className="cloud-bubble front dark"></span>
            <span className="raindrop r1"></span>
            <span className="raindrop r2"></span>
            <span className="raindrop r3"></span>
          </div>
        )}
      </div>

      <div className="weather-info">
        <strong className="weather-temp">
          {isWeatherLoading ? '...' : `${weather?.temp ?? 28}°C`}
        </strong>
        <span className="weather-meta">
          {weather?.city || 'Hyderabad'} • {isWeatherLoading ? 'Updating...' : safeCondition}
        </span>
      </div>
    </div>
  );
}
