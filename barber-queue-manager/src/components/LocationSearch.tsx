import React, { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LocationSearchProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
    formatted_address: string;
  }) => void;
  placeholder?: string;
  className?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder = "Search for your location...",
  className = ""
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

  useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      setIsLoaded(true);
    }).catch((error) => {
      console.error('Error loading Google Maps for autocomplete:', error);
    });
  }, []);

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      // Initialize autocomplete
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['geocode'],
        fields: ['formatted_address', 'geometry', 'name']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        
        if (place.geometry?.location && place.formatted_address) {
          const location = {
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            address: place.name || place.formatted_address,
            formatted_address: place.formatted_address
          };
          
          onLocationSelect(location);
          setSearchValue(place.formatted_address);
        }
      });

      autocompleteRef.current = autocomplete;
    }
  }, [isLoaded, onLocationSelect]);

  const handleManualSearch = () => {
    if (!searchValue.trim() || !isLoaded) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchValue }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const result = results[0];
        const location = {
          latitude: result.geometry.location.lat(),
          longitude: result.geometry.location.lng(),
          address: result.formatted_address,
          formatted_address: result.formatted_address
        };
        
        onLocationSelect(location);
      } else {
        console.error('Geocoding failed:', status);
      }
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleManualSearch();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10 pr-20"
          disabled={!isLoaded}
        />
        <Button
          size="sm"
          onClick={handleManualSearch}
          disabled={!searchValue.trim() || !isLoaded}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7"
        >
          Search
        </Button>
      </div>
      
      {!isLoaded && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-white border rounded-md shadow-sm">
          <div className="text-sm text-gray-500">Loading location search...</div>
        </div>
      )}
      
      {GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY' && (
        <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded-md shadow-sm">
          <div className="text-sm text-yellow-800">
            Add Google Maps API key for location search
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;