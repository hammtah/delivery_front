'use client';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { useEffect, useState } from 'react';

// Fix for default marker icon
const icon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// User position marker icon (red dot)
const userIcon = new Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapEvents = ({ onLocationSelect }) => {
  useMapEvents({
    click: async (e) => {
        //get lat and long from click
      const { lat, lng } = e.latlng;
      
      //get the address details (city, country...) from the lat and long
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        
        if (data) {
          const address = data.address;
          const newAddress = {
            street: address.road || '',
            city: address.city || address.town || '',
            neighborhood: address.neighbourhood || '',
            street_code: parseInt(address.house_number) || 0,
            postal_code: parseInt(address.postcode) || 0,
            province: address.state || '',
            position: {
              name: address.display_name || '',
              longitude: lng.toString(),
              latitude: lat.toString()
            }
          };
          onLocationSelect([lat, lng], newAddress);
        }
      } catch (error) {
        console.error('Error fetching address details:', error);
      }
    },
  });
  return null;
};

const LocationMarker = ({ position, onLocationSelect }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);

  return position ? <Marker position={position} icon={icon} /> : null;
};

const UserLocationMarker = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, 15);
    }
  }, [position, map]);

  return position ? (
    <Marker 
      position={position} 
      icon={userIcon}
      title="Your current location"
    />
  ) : null;
};

const Map = ({ selectedPosition, onLocationSelect, doWeNeedUserPosition }) => {
  const [userPosition, setUserPosition] = useState(null);
  const [defaultPosition] = useState([51.505, -0.09]); // Fallback position
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let timeoutId;

    const getLocation = () => {
      if ("geolocation" in navigator) {
        const options = {
          enableHighAccuracy: true,
          timeout: 10000, // Increased timeout to 10 seconds
          maximumAge: 0
        };

        timeoutId = setTimeout(() => {
          setIsLoading(false);
          setError("Location request timed out. Using default location.");
        }, options.timeout);

        navigator.geolocation.getCurrentPosition(
          (position) => {
            clearTimeout(timeoutId);
            const { latitude, longitude } = position.coords;
            setUserPosition([latitude, longitude]);
            setIsLoading(false);
          },
          (error) => {
            clearTimeout(timeoutId);
            console.error("Error getting location:", error);
            setError(error.message);
            setIsLoading(false);
          },
          options
        );
      } else {
        setIsLoading(false);
        setError("Geolocation is not supported by your browser");
      }
    };

    getLocation();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="h-[700px] border rounded-lg bg-muted flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>{doWeNeedUserPosition? 'Getting your location...' : 'Getting Restaurant\'s location...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[700px] border rounded-lg">
      {error && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      <MapContainer
        center={userPosition || defaultPosition}
        zoom={15}
        minZoom={3}
        maxZoom={19}
        zoomControl={true}
        style={{ height: '100%', width: '100%' }}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
          maxNativeZoom={19}
          tileSize={256}
          zoomOffset={0}
          detectRetina={false}
        />
        <MapEvents onLocationSelect={onLocationSelect} />
        {doWeNeedUserPosition && (<UserLocationMarker position={userPosition} />)}
        <LocationMarker position={selectedPosition} onLocationSelect={onLocationSelect} />
      </MapContainer>
    </div>
  );
};

export default Map; 