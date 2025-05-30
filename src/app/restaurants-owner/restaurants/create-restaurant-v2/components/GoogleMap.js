'use client';

import { useEffect, useRef, useState } from 'react';

const GoogleMap = ({ apiKey, selectedPosition, onLocationSelect, searchQuery }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);
  const searchBoxRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    script.onerror = () => {
      setError('Error loading Google Maps. Please try again later.');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(script);
      if (mapInstance.current) {
        mapInstance.current = null;
      }
    };
  }, [apiKey]);

  const initMap = () => {
    try {
      // Initialize map
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 }, // Default to New York
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      mapInstance.current = map;

      // Initialize search box
      const searchBox = new google.maps.places.SearchBox(document.createElement('input'));
      searchBoxRef.current = searchBox;

      // Add click listener to map
      map.addListener('click', async (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        // Get address details using reverse geocoding
        const geocoder = new google.maps.Geocoder();
        try {
          const response = await geocoder.geocode({ location: { lat, lng } });
          if (response.results[0]) {
            const addressComponents = response.results[0].address_components;
            const address = {
              street: '',
              city: '',
              neighborhood: '',
              street_code: 0,
              postal_code: 0,
              province: '',
              position: {
                name: response.results[0].formatted_address,
                longitude: lng.toString(),
                latitude: lat.toString()
              }
            };

            // Parse address components
            addressComponents.forEach(component => {
              const types = component.types;
              if (types.includes('street_number')) {
                address.street_code = parseInt(component.long_name) || 0;
              } else if (types.includes('route')) {
                address.street = component.long_name;
              } else if (types.includes('locality')) {
                address.city = component.long_name;
              } else if (types.includes('sublocality')) {
                address.neighborhood = component.long_name;
              } else if (types.includes('postal_code')) {
                address.postal_code = parseInt(component.long_name) || 0;
              } else if (types.includes('administrative_area_level_1')) {
                address.province = component.long_name;
              }
            });

            // Update marker
            if (markerRef.current) {
              markerRef.current.setMap(null);
            }
            markerRef.current = new google.maps.Marker({
              position: { lat, lng },
              map,
              animation: google.maps.Animation.DROP
            });

            onLocationSelect([lat, lng], address);
          }
        } catch (error) {
          console.error('Error getting address details:', error);
          setError('Error getting address details. Please try again.');
        }
      });

      // Handle search box results
      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places.length === 0) return;

        const place = places[0];
        if (!place.geometry || !place.geometry.location) return;

        // Update map view
        map.setCenter(place.geometry.location);
        map.setZoom(17);

        // Update marker
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }
        markerRef.current = new google.maps.Marker({
          position: place.geometry.location,
          map,
          animation: google.maps.Animation.DROP
        });

        // Get address details
        const address = {
          street: '',
          city: '',
          neighborhood: '',
          street_code: 0,
          postal_code: 0,
          province: '',
          position: {
            name: place.formatted_address,
            longitude: place.geometry.location.lng().toString(),
            latitude: place.geometry.location.lat().toString()
          }
        };

        // Parse address components
        place.address_components.forEach(component => {
          const types = component.types;
          if (types.includes('street_number')) {
            address.street_code = parseInt(component.long_name) || 0;
          } else if (types.includes('route')) {
            address.street = component.long_name;
          } else if (types.includes('locality')) {
            address.city = component.long_name;
          } else if (types.includes('sublocality')) {
            address.neighborhood = component.long_name;
          } else if (types.includes('postal_code')) {
            address.postal_code = parseInt(component.long_name) || 0;
          } else if (types.includes('administrative_area_level_1')) {
            address.province = component.long_name;
          }
        });

        onLocationSelect(
          [place.geometry.location.lat(), place.geometry.location.lng()],
          address
        );
      });

      // Get user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            map.setCenter(userLocation);
            map.setZoom(15);
          },
          (error) => {
            console.error('Error getting user location:', error);
          }
        );
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Error loading map. Please try again later.');
    }
  };

  // Handle search query changes
  useEffect(() => {
    if (searchBoxRef.current && searchQuery) {
      searchBoxRef.current.setQuery(searchQuery);
    }
  }, [searchQuery]);

  return (
    <div className="relative">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      <div ref={mapRef} className="h-[700px] w-full rounded-lg" />
    </div>
  );
};

export default GoogleMap; 