import { 
  WiHumidity, 
  WiStrongWind, 
  WiSunrise, 
  WiSunset, 
  WiBarometer, 
  WiRaindrops, 
  WiCloudy, 
  WiStormWarning,
  WiHot,
  WiSnowflakeCold,
  WiThermometer,
  WiThermometerExterior,
  WiWindDeg,
  WiCloudyGusts,
  WiDaySunny,
  WiNightClear,
  WiRain,
  WiStrongWind as WiWind
} from 'react-icons/wi';
import { FaTemperatureHigh, FaTemperatureLow } from 'react-icons/fa';
import { BsSunFill, BsEyeFill, BsDropletHalf, BsSunrise } from 'react-icons/bs';
import { format } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState, useRef } from 'react';

// Temperature utility functions
const getTemperatureIcon = (temp) => {
  if (temp <= 0) return WiSnowflakeCold;
  if (temp <= 15) return WiThermometerExterior;
  if (temp <= 25) return WiThermometer;
  if (temp <= 32) return WiHot;
  return WiHot;
};

const getTemperatureColor = (temp) => {
  if (temp <= 0) return 'text-blue-500';
  if (temp <= 15) return 'text-cyan-400';
  if (temp <= 25) return 'text-green-400';
  if (temp <= 32) return 'text-orange-400';
  return 'text-red-500';
};

const getTemperatureGradient = (temp) => {
  if (temp <= 0) return 'from-blue-500/20 to-blue-600/10';
  if (temp <= 15) return 'from-cyan-500/20 to-cyan-600/10';
  if (temp <= 25) return 'from-green-500/20 to-green-600/10';
  if (temp <= 32) return 'from-orange-500/20 to-orange-600/10';
  return 'from-red-500/20 to-red-600/10';
};

const AnimatedIcon = ({ icon: Icon, animation, size = 'base', colorClass = '' }) => (
  <div className="relative">
    <Icon className={`
      ${size === 'large' ? 'text-6xl sm:text-7xl' : size === 'medium' ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'}
      ${animation}
      ${colorClass}
    `} />
  </div>
);

const TempDisplay = ({ temperature, size = 'large' }) => {
  const Icon = getTemperatureIcon(temperature);
  const colorClass = getTemperatureColor(temperature);
  return (
    <div className="flex items-center gap-2">
      <AnimatedIcon 
        icon={Icon}
        animation="animate-float"
        size={size}
        colorClass={colorClass}
      />
      <span className={`
        ${size === 'large' ? 'text-5xl sm:text-6xl md:text-7xl font-bold' : 'text-2xl font-semibold'}
        ${colorClass}
      `}>
        {temperature}°C
      </span>
    </div>
  );
};

const DetailCard = ({ icon: Icon, value, label, animation }) => {
  // Get theme colors based on icon type
  const getIconTheme = () => {
    if (Icon === WiHumidity || Icon === BsDropletHalf) return {
      icon: 'text-blue-400',
      glow: 'from-blue-400/30 to-cyan-300/20'
    };
    if (Icon === WiWind || Icon === WiCloudyGusts) return {
      icon: 'text-teal-400',
      glow: 'from-teal-400/30 to-emerald-300/20'
    };
    if (Icon === WiBarometer) return {
      icon: 'text-purple-400',
      glow: 'from-purple-400/30 to-indigo-300/20'
    };
    if (Icon === WiRain || Icon === WiRaindrops) return {
      icon: 'text-blue-500',
      glow: 'from-blue-500/30 to-blue-400/20'
    };
    if (Icon === WiCloudy) return {
      icon: 'text-gray-400',
      glow: 'from-gray-400/30 to-slate-300/20'
    };
    if (Icon === BsSunFill || Icon === WiDaySunny || Icon === BsSunrise) return {
      icon: 'text-yellow-400',
      glow: 'from-yellow-400/30 to-amber-300/20'
    };
    if (Icon === BsEyeFill) return {
      icon: 'text-indigo-400',
      glow: 'from-indigo-400/30 to-indigo-300/20'
    };
    if (Icon === WiThermometer || Icon === WiHot) return {
      icon: 'text-red-400',
      glow: 'from-red-400/30 to-orange-300/20'
    };
    return {
      icon: 'text-sky-400',
      glow: 'from-sky-400/30 to-blue-300/20'
    };
  };

  const theme = getIconTheme();
  const finalAnimation = Icon === BsSunFill ? "animate-rotate" : animation;
  
  return (
    <div className="glass-effect rounded-xl p-4 transition-transform hover:scale-105 relative overflow-hidden">
      {/* Glow Effect Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${theme.glow} opacity-60 blur-xl`}></div>
      
      {/* Content */}
      <div className="relative z-10">
        <div className="relative">
          <div className={`absolute inset-0 ${theme.icon} blur-md opacity-50`}>
            <AnimatedIcon 
              icon={Icon}
              animation={finalAnimation}
              size="medium"
            />
          </div>
          <AnimatedIcon 
            icon={Icon}
            animation={finalAnimation}
            size="medium"
            colorClass={theme.icon}
          />
        </div>
        <div className="mt-2">
          <p className="text-lg font-semibold text-white">{value}</p>
          <p className="text-sm text-white/70">{label}</p>
        </div>
      </div>
    </div>
  );
};

const WeatherCard = ({ weatherData, isDaytime }) => {
  const { current, hourly, daily } = weatherData;
  const hourlyScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (hourlyScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = hourlyScrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (hourlyScrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      hourlyScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      71: 'Slight snow',
      73: 'Moderate snow',
      75: 'Heavy snow',
      95: 'Thunderstorm',
    };
    return weatherCodes[code] || 'Unknown';
  };

  const formatTime = (timeString) => {
    return format(new Date(timeString), 'h:mm a');
  };

  return (
    <div className="space-y-6">
      {/* Main Weather Display */}
      <div className={`z-[10]relative overflow-hidden rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl transition-all duration-500 ${
        isDaytime ? 'bg-gradient-to-br from-sky-400/30 to-blue-600/30' : 'bg-gradient-to-br from-gray-900/40 to-indigo-900/40'
      }`}>
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${
            isDaytime ? 'bg-yellow-500' : 'bg-blue-500'
          } opacity-20 animate-pulse-glow`}></div>
          <div className={`absolute -bottom-32 -left-32 w-96 h-96 rounded-full ${
            isDaytime ? 'bg-orange-500' : 'bg-indigo-500'
          } opacity-10 animate-pulse-glow`}></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Top Section with Current Weather */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-8">
            {/* Left Side - Current Weather */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <AnimatedIcon 
                  icon={isDaytime ? WiDaySunny : WiNightClear}
                  animation={isDaytime ? "animate-rotate" : "animate-float"}
                  size="large"
                  colorClass={isDaytime ? 'text-yellow-400' : 'text-blue-300'}
                />
                <TempDisplay temperature={current.temperature} size="large" />
              </div>
              <p className="text-2xl md:text-3xl text-white/90 font-medium mb-2">
                {getWeatherDescription(current.weathercode)}
              </p>
              <p className="text-xl text-white/80">
                Feels like {current.apparentTemperature}°C
              </p>
            </div>

            {/* Right Side - Daily Overview */}
            <div className="mt-6 md:mt-0 flex flex-col items-end gap-6">
              <div className="flex gap-8">
                <div className="text-center">
                  <AnimatedIcon 
                    icon={WiSunrise} 
                    animation="animate-float"
                    colorClass="text-yellow-300"
                  />
                  <p className="text-white/90 mt-1">{formatTime(daily.sunrise)}</p>
                  <p className="text-sm text-white/70">Sunrise</p>
                </div>
                <div className="text-center">
                  <AnimatedIcon 
                    icon={WiSunset} 
                    animation="animate-float"
                    colorClass="text-orange-300"
                  />
                  <p className="text-white/90 mt-1">{formatTime(daily.sunset)}</p>
                  <p className="text-sm text-white/70">Sunset</p>
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-center">
                  <TempDisplay temperature={daily.maxTemp} size="small" />
                  <p className="text-sm text-white/70">High</p>
                </div>
                <div className="text-center">
                  <TempDisplay temperature={daily.minTemp} size="small" />
                  <p className="text-sm text-white/70">Low</p>
                </div>
              </div>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
            <DetailCard
              icon={WiThermometer}
              value={`${weatherData.current.apparentTemperature}°C`}
              label="Feels Like"
            />
            <DetailCard
              icon={WiHumidity}
              value={`${weatherData.current.humidity}%`}
              label="Humidity"
            />
            <DetailCard
              icon={WiCloudyGusts}
              value={`${weatherData.current.windspeed} km/h`}
              label="Wind Speed"
            />
            <DetailCard
              icon={WiBarometer}
              value={`${Math.round(weatherData.current.pressure)} hPa`}
              label="Pressure"
            />
            <DetailCard
              icon={WiCloudy}
              value={`${weatherData.current.cloudCover}%`}
              label="Cloud Cover"
            />
            <DetailCard
              icon={WiRaindrops}
              value={`${weatherData.current.precipitation} mm`}
              label="Precipitation"
            />
            <DetailCard
              icon={BsDropletHalf}
              value={`${Math.round(weatherData.current.dewPoint)}°C`}
              label="Dew Point"
            />
            <DetailCard
              icon={BsEyeFill}
              value={`${Math.round(weatherData.current.visibility / 1000)} km`}
              label="Visibility"
            />
            <DetailCard
              icon={WiHot}
              value={`${Math.round(weatherData.current.wetBulbTemp)}°C`}
              label="Wet Bulb Temp"
            />
            <DetailCard
              icon={WiDaySunny}
              value={weatherData.current.uvIndexClearSky.toFixed(1)}
              label="UV Index"
            />
            <DetailCard
              icon={BsSunrise}
              value={`${Math.round(weatherData.daily.sunshineDuration / 3600)}h`}
              label="Sunshine"
            />
            <DetailCard
              icon={WiRain}
              value={`${weatherData.current.precipitationProbability}%`}
              label="Precip. Chance"
            />
          </div>
        </div>
      </div>

      {/* Hourly Forecast with Navigation */}
      <div className={`rounded-3xl p-6 backdrop-blur-xl shadow-xl ${
        isDaytime 
          ? 'bg-gradient-to-r from-blue-400/20 to-sky-500/20' 
          : 'bg-gradient-to-r from-gray-900/30 to-indigo-900/30'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-semibold text-white">24-Hour Forecast</h3>
          <div className="flex gap-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full ${
                canScrollLeft 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-white/40'
              } transition-colors`}
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`p-2 rounded-full ${
                canScrollRight 
                  ? 'text-white hover:bg-white/10' 
                  : 'text-white/40'
              } transition-colors`}
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        <div 
          ref={hourlyScrollRef}
          onScroll={handleScroll}
          className="overflow-x-hidden"
        >
          <div className="flex gap-4 min-w-max">
            {hourly.time.map((time, index) => {
              const temp = hourly.temperature[index];
              const colorClass = getTemperatureColor(temp);
              return (
                <div
                  key={time}
                  className="flex flex-col items-center p-3 rounded-xl glass-effect transition-transform hover:scale-105"
                >
                  <span className="text-white/90 text-sm mb-2">
                    {format(new Date(time), 'ha')}
                  </span>
                  <span className={`text-2xl font-semibold ${colorClass}`}>
                    {temp}°C
                  </span>
                  <div className="flex items-center gap-1 mt-2">
                    <AnimatedIcon 
                      icon={WiWind}
                      animation="animate-wind"
                      size="small"
                      colorClass="text-white/70"
                    />
                    <span className="text-white/70 text-sm">
                      {hourly.windspeed[index]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard; 