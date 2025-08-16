import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { BarberShop } from '../shared/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Navigation, Star, Clock } from 'lucide-react';

interface GoogleMapProps {
  shops: BarberShop[];
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  selectedShop?: BarberShop | null;
  onShopSelect?: (shop: BarberShop) => void;
  height?: string;
  className?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  shops,
  userLocation,
  selectedShop,
  onShopSelect,
  height = '400px',
  className = ''
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [infoWindows, setInfoWindows] = useState<google.maps.InfoWindow[]>([]);
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Google Maps API key - in production, this should come from environment variables
  const GOOGLE_MAPS_API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_MAPS_API_KEY';

  useEffect(() => {
    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: 'weekly',
      libraries: ['places', 'geometry']
    });

    loader.load().then(() => {
      setIsLoaded(true);
    }).catch((error) => {
      console.error('Error loading Google Maps:', error);
    });
  }, []);

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      const defaultCenter = userLocation
        ? { lat: userLocation.latitude, lng: userLocation.longitude }
        : { lat: 37.7749, lng: -122.4194 }; // Default to San Francisco

      const newMap = new google.maps.Map(mapRef.current, {
        zoom: 12,
        center: defaultCenter,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      setMap(newMap);
      
      // Initialize directions service and renderer
      const directionsServiceInstance = new google.maps.DirectionsService();
      const directionsRendererInstance = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#3B82F6',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      
      setDirectionsService(directionsServiceInstance);
      setDirectionsRenderer(directionsRendererInstance);
      directionsRendererInstance.setMap(newMap);
    }
  }, [isLoaded, map, userLocation]);

  useEffect(() => {
    if (map && shops.length > 0) {
      // Clear existing markers and info windows
      markers.forEach(marker => marker.setMap(null));
      infoWindows.forEach(infoWindow => infoWindow.close());
      
      const newMarkers: google.maps.Marker[] = [];
      const newInfoWindows: google.maps.InfoWindow[] = [];

      // Add user location marker if available
      if (userLocation) {
        const userMarker = new google.maps.Marker({
          position: { lat: userLocation.latitude, lng: userLocation.longitude },
          map,
          title: 'Your Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          }
        });
        newMarkers.push(userMarker);
      }

      // Add shop markers
      shops.forEach((shop) => {
        const marker = new google.maps.Marker({
          position: { lat: shop.address.latitude, lng: shop.address.longitude },
          map,
          title: shop.name,
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: selectedShop?.id === shop.id ? '#EF4444' : '#10B981',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 1,
            rotation: 90
          }
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: bold;">${shop.name}</h3>
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 4px;">
                <span>⭐</span>
                <span style="font-size: 14px;">${shop.stats.averageRating} (${shop.stats.totalReviews} reviews)</span>
              </div>
              <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 8px;">
                <span>🕒</span>
                <span style="font-size: 14px;">~${shop.stats.averageWaitTime}m wait</span>
              </div>
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">${shop.address.street}, ${shop.address.city}</p>
              <div style="display: flex; gap: 8px;">
                <button 
                  onclick="window.selectShop('${shop.id}')" 
                  style="background: #3B82F6; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer;"
                >
                  Select Shop
                </button>
                ${userLocation ? `
                  <button 
                    onclick="window.getDirections('${shop.id}')" 
                    style="background: #10B981; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer;"
                  >
                    Directions
                  </button>
                ` : ''}
              </div>
            </div>
          `
        });

        marker.addListener('click', () => {
          // Close all info windows
          newInfoWindows.forEach(iw => iw.close());
          infoWindow.open(map, marker);
        });

        newMarkers.push(marker);
        newInfoWindows.push(infoWindow);
      });

      setMarkers(newMarkers);
      setInfoWindows(newInfoWindows);

      // Fit map to show all markers
      if (newMarkers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        newMarkers.forEach(marker => {
          if (marker.getPosition()) {
            bounds.extend(marker.getPosition()!);
          }
        });
        map.fitBounds(bounds);
        
        // Ensure minimum zoom level
        google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
          if (map.getZoom()! > 15) {
            map.setZoom(15);
          }
        });
      }
    }
  }, [map, shops, selectedShop, userLocation]);

  // Global functions for info window buttons
  useEffect(() => {
    (window as any).selectShop = (shopId: string) => {
      const shop = shops.find(s => s.id === shopId);
      if (shop && onShopSelect) {
        onShopSelect(shop);
      }
    };

    (window as any).getDirections = (shopId: string) => {
      const shop = shops.find(s => s.id === shopId);
      if (shop && userLocation && directionsService && directionsRenderer) {
        getDirections(shop);
      }
    };

    return () => {
      delete (window as any).selectShop;
      delete (window as any).getDirections;
    };
  }, [shops, userLocation, directionsService, directionsRenderer, onShopSelect]);

  const getDirections = (shop: BarberShop) => {
    if (!userLocation || !directionsService || !directionsRenderer) return;

    const request: google.maps.DirectionsRequest = {
      origin: { lat: userLocation.latitude, lng: userLocation.longitude },
      destination: { lat: shop.address.latitude, lng: shop.address.longitude },
      travelMode: google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK' && result) {
        directionsRenderer.setDirections(result);
        
        // Show directions info
        const route = result.routes[0];
        const leg = route.legs[0];
        
        // You could show this in a toast or info panel
        console.log(`Distance: ${leg.distance?.text}, Duration: ${leg.duration?.text}`);
      } else {
        console.error('Directions request failed:', status);
      }
    });
  };

  const clearDirections = () => {
    if (directionsRenderer) {
      directionsRenderer.set('directions', null);
    }
  };

  if (!isLoaded) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        style={{ height, width: '100%' }} 
        className="rounded-lg shadow-lg"
      />
      
      {/* Map controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Button
          size="sm"
          variant="secondary"
          className="bg-white shadow-lg"
          onClick={() => {
            if (map && userLocation) {
              map.setCenter({ lat: userLocation.latitude, lng: userLocation.longitude });
              map.setZoom(14);
            }
          }}
          disabled={!userLocation}
        >
          <Navigation className="w-4 h-4" />
        </Button>
        
        <Button
          size="sm"
          variant="secondary"
          className="bg-white shadow-lg"
          onClick={clearDirections}
        >
          Clear Route
        </Button>
      </div>

      {/* API Key warning */}
      {GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY' && (
        <div className="absolute bottom-4 left-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
          <p className="text-yellow-800 text-sm">
            <strong>Note:</strong> Add your Google Maps API key to <code>VITE_GOOGLE_MAPS_API_KEY</code> environment variable for full functionality.
          </p>
        </div>
      )}
    </div>
  );
};

export default GoogleMap;