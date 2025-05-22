'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import RestaurantForm from './components/RestaurantForm';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => <div className="h-[700px] border rounded-lg bg-muted flex items-center justify-center">Loading map...</div>
});

const CreateRestaurantPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [addressDetails, setAddressDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        router.push('/restaurants-owner/restaurants');
      } else {
        setIsSubmitting(false);
        console.error('Error creating restaurant');
      }
    } catch (error) {
        setIsSubmitting(false);
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create New Restaurant</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Map 
            selectedPosition={selectedPosition}
            onLocationSelect={handleLocationSelect}
          />
          <div className="mt-4 flex gap-2">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location..."
              className="flex-1"
            />
            <Button
              onClick={handleSearch}
              variant="secondary"
            >
              Search
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <RestaurantForm
              formData={formData}
              setFormData={setFormData}
              addressDetails={addressDetails}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRestaurantPage;

