'use client'
import React from 'react'

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
const Map = dynamic(() => import('./components/zone-map'), {
  ssr: false,
  loading: () => <div className="h-[700px] border rounded-lg bg-muted flex items-center justify-center">Loading map...</div>
});


const handleLocationSelect = (position, address) => {
    setSelectedPosition(position);
    setAddressDetails(address);
    setFormData(prev => ({
      ...prev,
      address
    }));
  };


export default function ZoneCreatePage() {
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
        name: "",
        status: "active",
        radius: "",
        type: "circle",
        user_fees: "",
        partial_commission: "",
        full_commission: "",
        points: [],
        center_address: {
            street: "",
            city: "",
            neighberhood: "",
            street_code: "",
            postal_code: "",
            province: ""
        }
    })
    return (
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-6">Create New Restaurant</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Map 
                selectedPosition={selectedPosition}
                onLocationSelect={handleLocationSelect}
                doWeNeedUserPosition={true}
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
                        placeholder={loadingCity ? "Getting your city..." : "Enter city..."}
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
}
