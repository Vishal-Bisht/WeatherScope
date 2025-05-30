# WeatherScope 🌦️

A modern, responsive weather application built with React that provides real-time weather information with a beautiful, dynamic user interface.

https://weather-app-three-olive-95.vercel.app/

## ✨ Features

- **Real-Time Weather Data**: Get current weather conditions for any location worldwide
- **Dynamic Day/Night Themes**: UI adapts based on local time of searched location
- **Detailed Weather Information**:
  - Temperature (current, feels like, min/max)
  - Humidity and Dew Point
  - Wind Speed and Direction
  - Atmospheric Pressure
  - Cloud Cover
  - Precipitation
  - UV Index
  - Visibility
  - Wet Bulb Temperature
  - Sunshine Duration
  
- **24-Hour Forecast**: Hourly weather predictions with temperature and wind speed
- **Location-Based Background**: Dynamic background images based on searched location (requires Unsplash API key)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Smart Search**: Auto-complete location search with debouncing
- **Beautiful UI Elements**:
  - Glass-morphism effects
  - Smooth animations
  - Dynamic color themes
  - Animated weather icons
  - Responsive layout


### Installation

1. Clone the repository:
```bash
git clone https://github.com/Vishal-Bisht/WeatherScope.git
cd weatherscope
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```
<!-- 
3. Create a `.env` file in the root directory and add your Unsplash API key (optional):
```env
VITE_UNSPLASH_API_KEY=your_unsplash_api_key_here
``` -->

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## 🛠️ Built With

- [React](https://reactjs.org/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [React Icons](https://react-icons.github.io/react-icons/) - Icons
- [Axios](https://axios-http.com/) - HTTP client
- [Open-Meteo API](https://open-meteo.com/) - Weather data
<!-- - [Unsplash API](https://unsplash.com/developers) - Location images -->

## 📱 API Integration

### Weather Data
The app uses the Open-Meteo API for weather data:
- Geocoding API for location search
- Weather Forecast API for current conditions and forecasts

<!-- ### Background Images
Optional integration with Unsplash API for location-based background images:
- Requires an API key from Unsplash
- Automatically fetches relevant images for searched locations
- Proper attribution included -->


<!-- ## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. -->

## 🙏 Acknowledgments

- Weather data provided by [Open-Meteo](https://open-meteo.com/)
<!-- - Location images provided by [Unsplash](https://unsplash.com/) -->
- Icons from [React Icons](https://react-icons.github.io/react-icons/)
- Inspired by modern weather app designs