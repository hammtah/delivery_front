'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import RestaurantForm from '../create-restaurant/components/RestaurantForm';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { redirect } from 'next/navigation';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';

if(localStorage.getItem('token')==null){
    redirect('/restaurants/login')
}

// Dynamically import the Google Map component
const GoogleMap = dynamic(() => import('./components/GoogleMap'), {
  ssr: false,
  loading: () => <div className="h-[700px] border rounded-lg bg-muted flex items-center justify-center">Loading map...</div>
});

const CreateRestaurantPageV2 = () => {
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
      address: address
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/restaurant'), {
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
      <h1 className="text-2xl font-bold mb-6">Create New Restaurant (Google Maps Version)</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GoogleMap 
            apiKey="AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg"
            selectedPosition={selectedPosition}
            onLocationSelect={handleLocationSelect}
            searchQuery={searchQuery}
          />
          <div className="mt-4">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a location..."
              className="w-full"
            />
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

export default CreateRestaurantPageV2; 