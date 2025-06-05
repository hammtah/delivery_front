'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import RestaurantForm from '../../create-restaurant/components/RestaurantForm';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { redirect } from 'next/navigation';
import { toast } from 'sonner';
import { getApiUrl } from '@/utils/api';

if(localStorage.getItem('token')==null){
    redirect('/restaurants/login')
}

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import('../../create-restaurant/components/Map'), {
  ssr: false,
  loading: () => <div className="h-[700px] border rounded-lg bg-muted flex items-center justify-center">Loading map...</div>
});

const EditRestaurantPage = ({ params }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [addressDetails, setAddressDetails] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [loadingCity, setLoadingCity] = useState(true);
  const FOURSQUARE_API_KEY = 'fsq3g2oZGCZauIWMvcAydF/vuiPXkeoQbv+geMOczTdB49A=';
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

  // Fetch restaurant data
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(getApiUrl(`/api/restaurant/${params.id}`), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (response.ok) {
            setLoadingCity(false);
          const data = await response.json();
          const restaurant = data.data;
          // Set form data
          setFormData({
            name: restaurant.name,
            description: restaurant.description,
            image: restaurant.image || '',
            address: {
              street: restaurant.address.street,
              city: restaurant.address.city,
              neighborhood: '',
              street_code: restaurant.address.street_code,
              postal_code: restaurant.address.postal_code,
              province: restaurant.address.province,
              position: {
                name: restaurant.address.geoPosition.name,
                longitude: restaurant.address.geoPosition.longitude,
                latitude: restaurant.address.geoPosition.latitude
              }
            }
          });

          // Set city query
          setCityQuery(restaurant.address.city);
          //handle location
          handleLocationSelect([restaurant.address.geoPosition.latitude, restaurant.address.geoPosition.longitude], restaurant.address);

        } else {
          console.error('Error fetching restaurant');
          router.push('/restaurants-owner/restaurants');
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/restaurants-owner/restaurants');
      }
    };

    fetchRestaurant();
  }, [params.id, router]);

  const handleLocationSelect = (position, address) => {
    setSelectedPosition(position);
    setAddressDetails(address);
    setFormData(prev => ({
      ...prev,
      address
    }));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !cityQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(searchQuery)}&categories=13065&limit=50&near=${encodeURIComponent(cityQuery)}`,
        {
          headers: {
            'Authorization': FOURSQUARE_API_KEY,
            'Accept': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setSuggestions(data.results);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Error searching restaurants:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = async (suggestion) => {
    const position = [suggestion.geocodes.main.latitude, suggestion.geocodes.main.longitude];
    const address = {
      street: suggestion.location.address || '',
      city: suggestion.location.locality || '',
      neighborhood: suggestion.location.neighborhood?.[0] || '',
      street_code: suggestion.location.postcode || 0,
      postal_code: suggestion.location.postcode || 0,
      province: suggestion.location.region || '',
      position: {
        name: suggestion.name,
        longitude: suggestion.geocodes.main.longitude,
        latitude: suggestion.geocodes.main.latitude
      }
    };

    let imageUrl = '';
    setFormData(prev => ({
      ...prev,
      name: suggestion.name,
      image: imageUrl,
      address
    }));
    
    handleLocationSelect(position, address);
    setSearchQuery(suggestion.name);
    setShowSuggestions(false);
  };

  const handleCitySearch = async (query) => {
    if (!query.trim()) {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&type=city&limit=5`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setCitySuggestions(data);
        setShowCitySuggestions(true);
      } else {
        setCitySuggestions([]);
        setShowCitySuggestions(false);
      }
    } catch (error) {
      console.error('Error searching cities:', error);
      setCitySuggestions([]);
      setShowCitySuggestions(false);
    } finally {
    //   setLoadingCity(false);
    }
  };

  const handleCitySelect = (city) => {
    setCityQuery(city.display_name.split(',')[0]);
    setShowCitySuggestions(false);
    if (searchQuery.trim()) {
      handleSearch();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/api/restaurant/${params.id}`), {
        method: 'PUT',
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
        console.error('Error updating restaurant');
      }
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Restaurant</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Map 
            selectedPosition={selectedPosition}
            onLocationSelect={handleLocationSelect}
            doWeNeedUserPosition={false}
          />
          <div className="mt-4 relative">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <div className="w-1/3 relative">
                  <Input
                    type="text"
                    value={cityQuery}
                    onChange={(e) => {
                      setCityQuery(e.target.value);
                      handleCitySearch(e.target.value);
                    }}
                    placeholder={loadingCity ? "Getting Restaurant's city..." : "Enter city..."}
                    className="w-full"
                  />
                  {showCitySuggestions && citySuggestions.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      {citySuggestions.map((city, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleCitySelect(city)}
                        >
                          <div className="font-medium">{city.display_name.split(',')[0]}</div>
                          <div className="text-sm text-gray-600">
                            {city.display_name.split(',').slice(1).join(',').trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (cityQuery.trim()) {
                      handleSearch();
                    }
                  }}
                  placeholder="Search restaurant..."
                  className="w-2/3"
                />
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="font-medium">{suggestion.name}</div>
                      <div className="text-sm text-gray-600">
                        {suggestion.location.address}, {suggestion.location.locality}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              isEditing={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRestaurantPage; 