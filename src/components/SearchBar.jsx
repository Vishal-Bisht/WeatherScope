import { useState, useEffect, useRef } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import axios from 'axios';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  // Handle clicks outside of search container
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce function to limit API calls
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Fetch location suggestions
  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=en&format=json`
      );

      if (response.data.results) {
        setSuggestions(response.data.results);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced version of fetchSuggestions
  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    debouncedFetchSuggestions(value);
  };

  const handleSuggestionClick = (suggestion) => {
    // Format the full location name for display in the input
    const locationName = `${suggestion.name}${suggestion.admin1 ? `, ${suggestion.admin1}` : ''}${suggestion.country ? `, ${suggestion.country}` : ''}`;
    setQuery(locationName);
    setShowSuggestions(false);
    // Only search with the city name to ensure consistent results
    onSearch(suggestion.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      // For direct submissions, use the first word as the city name
      // This helps handle cases where users might have the full location name
      const searchTerm = query.split(',')[0].trim();
      onSearch(searchTerm);
    }
  };

  return (
    <div className="relative w-full" ref={searchContainerRef}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for a city..."
            className="w-full px-4 py-2 text-gray-700 bg-white/70 backdrop-blur-md rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg"
          />
          <button
            type="submit"
            className="absolute right-2 p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.length >= 2) && (
        <div className="absolute z-[9999] w-full mt-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="px-4 py-3 text-gray-600">Loading suggestions...</div>
          ) : suggestions.length > 0 ? (
            <ul className="max-h-60 overflow-auto">
              {suggestions.map((suggestion) => (
                <li
                  key={`${suggestion.id}-${suggestion.name}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-4 py-2 hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  <div className="text-gray-800 font-medium">
                    {suggestion.name}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {suggestion.admin1}{suggestion.admin1 && suggestion.country ? ', ' : ''}{suggestion.country}
                  </div>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 && (
            <div className="px-4 py-3 text-gray-600">No locations found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar; 