'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import RestaurantForm from './components/RestaurantForm';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { redirect } from 'next/navigation';
if(localStorage.getItem('token')==null){
    redirect('/restaurants/login')
  }

// Dynamically import the Map component to avoid SSR issues
const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
  loading: () => <div className="h-[700px] border rounded-lg bg-muted flex items-center justify-center">Loading map...</div>
});

const CreateRestaurantPage = () => {
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

  // Get user's current location and set city
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              // Use Nominatim for reverse geocoding
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await response.json();
              
              if (data.address) {
                const city = data.address.city || data.address.town || data.address.village || data.address.county;
                if (city) {
                  setCityQuery(city);
                  // Also set the initial map position
                  setSelectedPosition([latitude, longitude]);
                }
              }
            } catch (error) {
              console.error('Error getting city from coordinates:', error);
            }
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }
    };

    getUserLocation();
  }, []);

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
    console.log(suggestion);
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

    try {
      // Fetch detailed restaurant information
    //   const detailsResponse = await fetch(
    //     `https://api.foursquare.com/v3/places/${suggestion.fsq_id}`,
    //     {
    //       headers: {
    //         'Authorization': FOURSQUARE_API_KEY,
    //         'Accept': 'application/json'
    //       }
    //     }
    //   );
      
    //   const detailsData = await detailsResponse.json();
    //   console.log('Restaurant details:', detailsData);

    //   // Get the first photo URL if available
    //   let imageUrl = '';
    //   if (detailsData.photos && detailsData.photos.length > 0) {
    //     const photo = detailsData.photos[0];
    //     imageUrl = `${photo.prefix}original${photo.suffix}`;
    //   }
    let imageUrl = '';
      // Update form data with restaurant details
      setFormData(prev => ({
        ...prev,
        name: suggestion.name,
        image: imageUrl,
        address
      }));
      
      handleLocationSelect(position, address);
      setSearchQuery(suggestion.name);
      setShowSuggestions(false);
    } catch (error) {
      console.error('Error fetching restaurant details:', error);
      // Still update the form with basic information even if details fetch fails
      setFormData(prev => ({
        ...prev,
        name: suggestion.name,
        address
      }));
    }
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
        console.log(data);
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
    }
  };

  const handleCitySelect = (city) => {
    setCityQuery(city.display_name.split(',')[0]); // Get just the city name
    setShowCitySuggestions(false);
    // If there's a restaurant search query, trigger the restaurant search
    if (searchQuery.trim()) {
      handleSearch();
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
                    placeholder="Enter city..."
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRestaurantPage;

