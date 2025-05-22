'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

// Fix for default marker icon
const icon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const MapEvents = ({ onLocationSelect }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      
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

const Map = ({ selectedPosition, onLocationSelect }) => {
  return (
    <div className="h-[500px] border rounded-lg">
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents onLocationSelect={onLocationSelect} />
        {selectedPosition && (
          <Marker position={selectedPosition} icon={icon} />
        )}
      </MapContainer>
    </div>
  );
};

export default Map; 