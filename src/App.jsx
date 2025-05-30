import { useState, useEffect } from 'react';
import axios from 'axios';
import { WiDaySunny, WiNightClear, WiThermometer, WiTime1, WiSunrise } from 'react-icons/wi';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';

// Reuse the AnimatedIcon component
const AnimatedIcon = ({ icon: Icon, animation, size = 'base', colorClass = '' }) => (
  <div className="relative">
    <Icon className={`
      ${size === 'large' ? 'text-6xl sm:text-7xl' : size === 'medium' ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'}
      ${animation}
      ${colorClass}
    `} />
  </div>
);

const App = () => {
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [imageAuthor, setImageAuthor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDaytime, setIsDaytime] = useState(true);
  const [currentTime, setCurrentTime] = useState(null);
  const [timezone, setTimezone] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Determine if it's the initial landing page
  const isLandingPage = !weatherData && !loading && !error;

  // Replace this with your actual Unsplash API key
  const UNSPLASH_API_KEY = import.meta.env.VITE_UNSPLASH_API_KEY || '';

  // Add useEffect for updating time
  useEffect(() => {
    let timeInterval;
    if (timezone) {
      const updateTime = () => {
        const time = new Date().toLocaleTimeString('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        setCurrentTime(time);
      };
      updateTime(); // Initial update
      timeInterval = setInterval(updateTime, 1000); // Update every second
    }
    return () => {
      if (timeInterval) clearInterval(timeInterval);
    };
  }, [timezone]);

  const fetchWeatherData = async (city) => {
    try {
      setLoading(true);
      setError('');
      setIsTransitioning(true);

      // Get coordinates for the city
      console.log('Fetching coordinates for:', city);
      const geoResponse = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );

      console.log('Geocoding response:', geoResponse.data);

      if (!geoResponse.data.results?.length) {
        throw new Error(`Location "${city}" not found. Please try a different city name.`);
      }

      const { latitude, longitude, name, country, admin1 } = geoResponse.data.results[0];
      console.log(`Found coordinates: ${latitude}, ${longitude} for ${name}, ${country}`);

      // Get weather data with timezone
      console.log('Fetching weather data...');
      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,is_day,apparent_temperature,precipitation,cloud_cover,pressure_msl,surface_pressure,wind_gusts_10m,uv_index,dew_point_2m,visibility,wet_bulb_temperature_2m,uv_index_clear_sky,sunshine_duration,precipitation_probability&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,uv_index,precipitation_probability&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,sunshine_duration&timezone=auto`
      );

      console.log('Weather response:', weatherResponse.data);

      const current = weatherResponse.data.current;
      const hourly = weatherResponse.data.hourly;
      const daily = weatherResponse.data.daily;
      
      // Set location with more context
      const locationName = `${name}${admin1 ? `, ${admin1}` : ''}${country ? `, ${country}` : ''}`;
      setLocation(locationName);
      
      // Get background image - Handle this separately to not affect weather data
      if (UNSPLASH_API_KEY) {
        try {
          console.log('Fetching background image...');
          const searchQuery = `${name} ${country} city`;
          console.log('Image search query:', searchQuery);
          
          const imageResponse = await axios.get(
            `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&client_id=${UNSPLASH_API_KEY}&orientation=landscape&per_page=1`
          );
          
          if (imageResponse.data.results?.length) {
            const image = imageResponse.data.results[0];
            setBackgroundImage(image.urls.regular);
            setImageAuthor({
              name: image.user.name,
              username: image.user.username,
              link: image.user.links.html
            });
          } else {
            console.log('No images found for the location');
            setBackgroundImage('');
            setImageAuthor(null);
          }
        } catch (imageError) {
          console.error('Failed to fetch background image:', imageError);
          // Don't set any error state for image failures
          setBackgroundImage('');
          setImageAuthor(null);
        }
      }

      // Set isDaytime based on API response immediately
      setIsDaytime(current.is_day === 1);
      
      // Set all the data at once to prevent flashing
      setWeatherData({
        current: {
          temperature: current.temperature_2m,
          humidity: current.relative_humidity_2m,
          windspeed: current.wind_speed_10m,
          windDirection: current.wind_direction_10m,
          weathercode: current.weather_code,
          apparentTemperature: current.apparent_temperature,
          precipitation: current.precipitation,
          cloudCover: current.cloud_cover,
          pressure: current.pressure_msl,
          surfacePressure: current.surface_pressure,
          windGusts: current.wind_gusts_10m,
          uvIndex: current.uv_index,
          dewPoint: current.dew_point_2m,
          visibility: current.visibility,
          wetBulbTemp: current.wet_bulb_temperature_2m,
          uvIndexClearSky: current.uv_index_clear_sky,
          sunshineDuration: current.sunshine_duration,
          precipitationProbability: current.precipitation_probability
        },
        hourly: {
          time: hourly.time.slice(0, 24),
          temperature: hourly.temperature_2m.slice(0, 24),
          humidity: hourly.relative_humidity_2m.slice(0, 24),
          windspeed: hourly.wind_speed_10m.slice(0, 24),
          weathercode: hourly.weather_code.slice(0, 24),
          uvIndex: hourly.uv_index.slice(0, 24),
          precipitationProbability: hourly.precipitation_probability.slice(0, 24)
        },
        daily: {
          maxTemp: daily.temperature_2m_max[0],
          minTemp: daily.temperature_2m_min[0],
          sunrise: daily.sunrise[0],
          sunset: daily.sunset[0],
          uvIndexMax: daily.uv_index_max[0],
          precipitationSum: daily.precipitation_sum[0],
          sunshineDuration: daily.sunshine_duration[0]
        }
      });

      // Short delay to ensure smooth transition
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);

      // Set timezone from the API response
      setTimezone(weatherResponse.data.timezone);
      
    } catch (err) {
      console.error('Error details:', err);
      setTimezone(''); // Clear timezone on error
      if (err.response?.status === 404) {
        setError(`Location "${city}" not found. Please try a different city name.`);
      } else if (err.response?.status === 400) {
        setError('Invalid location name. Please try a different city name.');
      } else {
        setError(err.message || 'Failed to fetch weather data');
      }
      // Reset states on error
      setWeatherData(null);
      setBackgroundImage('');
      setImageAuthor(null);
      setIsTransitioning(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    fetchWeatherData(query);
  };

  return (
    <div className="min-h-screen relative bg-fixed transition-colors duration-500"
      style={{
        backgroundColor: isLandingPage ? '#1e293b' : (isDaytime ? '#0EA5E9' : '#0F172A')
      }}
    >
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`transition-opacity duration-500 ${isLandingPage ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-1/2 -right-48 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl opacity-20 animate-pulse"></div>
        </div>
        <div className={`transition-opacity duration-500 ${!isLandingPage ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full ${
            isDaytime ? 'bg-sky-400' : 'bg-indigo-900'
          } blur-3xl opacity-30 animate-pulse`}></div>
          <div className={`absolute top-1/2 -right-48 w-96 h-96 rounded-full ${
            isDaytime ? 'bg-blue-400' : 'bg-purple-900'
          } blur-3xl opacity-20 animate-pulse`}></div>
        </div>
      </div>

      {/* Background Image */}
      {backgroundImage && (
        <div
          className="fixed inset-0 z-0 transition-opacity duration-1000 pointer-events-none"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className={`absolute inset-0 ${
            isDaytime 
              ? 'bg-gradient-to-br from-sky-400/40 via-blue-400/30 to-blue-500/40' 
              : 'bg-gradient-to-br from-gray-900/70 via-indigo-900/50 to-purple-900/60'
          }`} />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10">
        {isLandingPage ? (
          <div className={`container mx-auto px-4 min-h-screen flex flex-col items-center justify-center transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              {/* Landing Page Content */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                Weather<span className="text-blue-400">Scope</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 mb-8 leading-relaxed">
                Discover real-time weather conditions for any location worldwide with beautiful visualizations and detailed forecasts.
              </p>
              
              {/* Search Bar with larger styling and higher z-index */}
              <div className="w-full max-w-md mx-auto transform hover:scale-105 transition-transform duration-300 relative z-50">
                <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-lg shadow-lg border border-white/10">
                  <SearchBar onSearch={handleSearch} />
                </div>
              </div>
              
              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 text-left relative z-10">
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                  <WiDaySunny className="text-3xl text-yellow-400 mb-2" />
                  <h3 className="text-lg font-semibold text-white mb-1">Real-Time Weather</h3>
                  <p className="text-gray-300">Get instant access to current weather conditions</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                  <WiThermometer className="text-3xl text-red-400 mb-2" />
                  <h3 className="text-lg font-semibold text-white mb-1">Detailed Metrics</h3>
                  <p className="text-gray-300">Comprehensive weather data and forecasts</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                  <WiTime1 className="text-3xl text-blue-400 mb-2" />
                  <h3 className="text-lg font-semibold text-white mb-1">24-Hour Forecast</h3>
                  <p className="text-gray-300">Hour-by-hour weather predictions</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-white/10">
                  <WiSunrise className="text-3xl text-orange-400 mb-2" />
                  <h3 className="text-lg font-semibold text-white mb-1">Sun Cycles</h3>
                  <p className="text-gray-300">Track sunrise, sunset, and UV index</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {/* App Title */}
            <div className="absolute top-4 left-4 sm:left-8">
              <h1 className={`text-2xl sm:text-3xl font-bold ${
                isDaytime ? 'text-white' : 'text-gray-100'
              } drop-shadow-lg hover:scale-105 transition-transform duration-300 select-none`}>
                WeatherScope
              </h1>
            </div>

            {/* Top Section with higher z-index for search */}
            <div className="container mx-auto px-4 pt-8 relative z-50">
              <div className="flex flex-col items-center">
                {/* Sun/Moon Icon */}
                <div className="mb-8 relative">
                  <div className={`absolute inset-0 ${
                    isDaytime ? 'bg-yellow-300' : 'bg-blue-300'
                  } blur-2xl opacity-30 scale-150`}></div>
                  <AnimatedIcon 
                    icon={isDaytime ? WiDaySunny : WiNightClear}
                    animation={isDaytime ? "animate-rotate" : "animate-float"}
                    size="large"
                    colorClass={isDaytime ? 'text-yellow-400' : 'text-blue-300'}
                  />
                </div>

                {/* Search Bar */}
                <div className="w-full max-w-md px-4 mb-8">
                  <div className={`p-2 rounded-2xl ${
                    isDaytime 
                      ? 'bg-white/10 backdrop-blur-lg' 
                      : 'bg-gray-800/10 backdrop-blur-lg'
                  } shadow-lg`}>
                    <SearchBar onSearch={handleSearch} />
                  </div>
                </div>
              </div>
            </div>

            {/* Loading Spinner */}
            {loading && (
              <div className="container mx-auto px-4 py-12 flex justify-center">
                <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
                  isDaytime ? 'border-white' : 'border-blue-400'
                } shadow-lg`}></div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="container mx-auto px-4 py-12 flex justify-center">
                <div className={`text-red-500 text-center ${
                  isDaytime ? 'bg-white/80' : 'bg-gray-900/80'
                } rounded-lg p-6 max-w-md backdrop-blur-md shadow-xl border border-red-200/20`}>
                  {error}
                </div>
              </div>
            )}

            {/* Weather Information */}
            {weatherData && !loading && (
              <div className="container mx-auto px-4 pb-8">
                <div className="text-center space-y-2">
                  <h1 className={`text-3xl md:text-4xl font-bold ${
                    isDaytime ? 'text-white' : 'text-gray-100'
                  } drop-shadow-lg`}>
                    {location}
                  </h1>
                  {currentTime && (
                    <p className={`text-xl md:text-2xl ${
                      isDaytime ? 'text-white/90' : 'text-gray-200/90'
                    } font-medium drop-shadow`}>
                      {currentTime}
                    </p>
                  )}
                </div>
                <div className="mt-6">
                  <WeatherCard weatherData={weatherData} isDaytime={isDaytime} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Unsplash Attribution */}
        {imageAuthor && (
          <div className="fixed bottom-4 right-4 text-sm text-white/90 bg-black/40 px-4 py-2 rounded-full backdrop-blur-md shadow-lg border border-white/10 hover:bg-black/50 transition-colors duration-300">
            Photo by{' '}
            <a
              href={`${imageAuthor.link}?utm_source=weather_app&utm_medium=referral`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-300 transition-colors duration-300"
            >
              {imageAuthor.name}
            </a>
            {' '}on{' '}
            <a
              href="https://unsplash.com/?utm_source=weather_app&utm_medium=referral"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-300 transition-colors duration-300"
            >
              Unsplash
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;