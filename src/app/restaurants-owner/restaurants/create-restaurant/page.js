'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import RestaurantForm from './components/RestaurantForm';

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => <div className="h-[500px] border rounded-lg bg-gray-100 flex items-center justify-center">Loading map...</div>
});

const CreateRestaurantPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [addressDetails, setAddressDetails] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    address: {
      street: '',
      city: '',
      neighborhood: '',
      street_code: 0,
      postal_code: 0,
      province: '',
      position: {
        name: '',
        longitude: '',
        latitude: ''
      }
    }
  });

  const handleLocationSelect = (position, address) => {
    setSelectedPosition(position);
    setAddressDetails(address);
    setFormData(prev => ({
      ...prev,
      address
    }));
  };

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        handleLocationSelect([parseFloat(lat), parseFloat(lon)]);
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/restaurants-owner/restaurants');
      } else {
        console.error('Error creating restaurant');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Restaurant</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Map 
            selectedPosition={selectedPosition}
            onLocationSelect={handleLocationSelect}
          />
          <div className="mt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location..."
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleSearch}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Search
            </button>
          </div>
        </div>

        <div>
          <RestaurantForm
            formData={formData}
            setFormData={setFormData}
            addressDetails={addressDetails}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateRestaurantPage;

