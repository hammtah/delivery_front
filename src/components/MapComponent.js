'use client';

import { useEffect, useRef } from 'react';
import L, { circle } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { Input } from "@/components/ui/input";
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

const MapComponent = ({ addressForm, setAddressForm, controls={
    polygon: true,
    polyline: false,
    rectangle: false,
    marker: true,
    circle: true,
    circlemarker: false,
    userPosition: true
  }, onCircleCreated, onPolygonCreated, initialZoneData, editing=true, changeAddressFormData }) => {
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const mapRefInstance = useRef(null);
  const drawControlRef = useRef(null);
  const ZOOM_LEVEL = 18; // Default zoom level for the map
  const drawnItemsRef = useRef(null);
  const circleMarkerRef = useRef(null);
    // Add this function to your component
const addCircleMarker = (lat, lng, popupText = '') => {
    if (mapRefInstance.current) {
        if(circleMarkerRef.current == null) {
            circleMarkerRef.current = L.circleMarker([lat, lng], {
                radius: 8,
                color: 'blue',
                fillColor: '#30f',
                fillOpacity: 0.7
            }).addTo(mapRefInstance.current);
        }
        else{
            circleMarkerRef.current.setLatLng([lat, lng]);
        }
      if (popupText) {
        circleMarkerRef.current.bindPopup(popupText);
      }
      return circleMarkerRef.current;
    }
  };

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
                addCircleMarker(latitude, longitude, city); // Add circle marker at user's location
                mapRefInstance.current.setView([latitude, longitude], ZOOM_LEVEL);
                // Also set the initial map position
              //   setSelectedPosition([latitude, longitude]);
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
  

  const handleCitySearch = async () => {
    if (!cityQuery.trim()) {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      return;
    }

    setIsLoadingCities(true);
    setShowCitySuggestions(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityQuery)}&type=city&limit=5`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setCitySuggestions(data);
      } else {
        setCitySuggestions([]);
      }
    } catch (error) {
      console.error('Error searching cities:', error);
      setCitySuggestions([]);
    } finally {
      setIsLoadingCities(false);
    }
  };

  const handleSearch = async (uSearchQuery) => {
    // if (!searchQuery.trim() || !cityQuery.trim()) {
    if ( !cityQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingPlaces(true);
    setShowSuggestions(true);

    try {
      const response = await fetch(
        `https://api.foursquare.com/v3/places/search?query=${encodeURIComponent(uSearchQuery)}&limit=50&near=${encodeURIComponent(cityQuery)}`,
        {
          headers: {
            'Authorization': process.env.NEXT_PUBLIC_FOURSQUARE_API_KEY,
            'Accept': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setSuggestions(data.results);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingPlaces(false);
    }
  };

  const getAddressDetails = async (c) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${c.lat}&lon=${c.lng}`
      );
      const data = await response.json();
      const address = data.address;
      console.log("address: ", address);

      if (address) {
        const city = address.city || address.town || address.village || address.county;
        // if (city) {
        setAddressForm({
        //   ...prev,
          city: address.city ? address.city : '',
          neighborhood: address.neighbourhood ? address.neighbourhood : '',
          street: address.street_code  || address.street || '',
          postal_code: address.postcode ? address.postcode : '',
          province: address.state_district ? address.state_district : '',
          position: {
            name: city ? city : '',
            longitude: c.lng ? c.lng : '',
            latitude: c.lat ? c.lat : ''
          }
        });
        console.log("form: ", addressForm);
        // }
      }
    } catch (error) {
      console.error('Error getting city from coordinates:', error);
    }
  };

  const circleHandler = (layer) => {
    const center = layer.getLatLng();
    const radius = layer.getRadius();
    console.log("Circle center:", center);
    console.log("Circle radius (meters):", radius);
    if (onCircleCreated) {
      onCircleCreated(center, radius);
    }
  };

  const polygonHandler = (layer) => {
    const latlngs = layer.getLatLngs()[0];
    const coordinates = latlngs.map(latlng => ({
      lat: latlng.lat,
      lng: latlng.lng
    }));
    console.log("Polygon Coordinates:", coordinates);
    if (onPolygonCreated) {
      onPolygonCreated(coordinates);
    }
  };

  const markerHandler = (layer) => {
    const latlng = layer.getLatLng();
    console.log("Marker Coordinates:", latlng);
    getAddressDetails({ lat: latlng.lat, lng: latlng.lng });
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Fix Leaflet defaul;t icon issue
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    const map = L.map(mapRef.current).setView([40.7128, -74.0060], ZOOM_LEVEL);
    mapRefInstance.current = map;
    // Get user location and set initial map view
    if(controls.userPosition == true){
        getUserLocation();
    }

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    drawnItemsRef.current = drawnItems;

    // Initialize the draw control and pass it the FeatureGroup of editable layers
    const drawControl = new L.Control.Draw({
      draw: controls,
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    });
    map.addControl(drawControl);
    drawControlRef.current = drawControl;

    // Handle created shapes
    map.on(L.Draw.Event.CREATED, function (event) {
      const layer = event.layer;
      if (drawnItems.getLayers().length >= 1) {
        drawnItems.clearLayers();
      }
      drawnItems.addLayer(layer);

      if (event.layerType === "circle") {
        circleHandler(layer);
      }
      if (event.layerType === "polygon") {
        polygonHandler(layer);
      }
        if (event.layerType === "marker") {
            markerHandler(layer);
        }
    });

    // Handle edited shapes
    map.on(L.Draw.Event.EDITED, function (event) {
      const layers = event.layers;
      layers.eachLayer(function (layer) {
        if (layer instanceof L.Circle) {
          // For circles, we need to handle both center and radius changes
          circleHandler(layer);
        }
        else if (layer instanceof L.Polygon) {
          polygonHandler(layer);
        }
        else if (layer instanceof L.Marker) {
          markerHandler(layer);
        }
      });
    });

    // Handle deleted shapes
    map.on(L.Draw.Event.DELETED, function (e) {
      drawnItems.clearLayers();
    });

    // Display initial zone data if provided
    if (initialZoneData) {
        console.log("initialZoneData", initialZoneData)
      if (initialZoneData.type === 'circle') {
        const center = initialZoneData.center_address.geoPosition;
        const circle = L.circle([center.latitude, center.longitude], {
          radius: initialZoneData.radius,
        //   color: 'blue',
        //   fillColor: '#30f',
        //   fillOpacity: 0.2
        color: '#ef6c00',
        fillColor: '#ffb74d',
        fillOpacity: 0.2
        }).addTo(drawnItems);
        
        // Center the map on the circle
        const bounds = circle.getBounds();
        if(bounds.isValid()) {
            map.fitBounds(bounds);
        }
        else{
            map.setView([center.latitude, center.longitude], ZOOM_LEVEL);
        }
      } else if (initialZoneData.type === 'polygon') {
        const coordinates = initialZoneData.points.map(point => [
          point.geoPosition.latitude,
          point.geoPosition.longitude
        ]);
        
        const polygon = L.polygon(coordinates, {
        //   color: 'blue',
        //   fillColor: '#30f',
        //   fillOpacity: 0.2
        color: '#ef6c00',
        fillColor: '#ffb74d',
        fillOpacity: 0.2
        }).addTo(drawnItems);
        
        // Center the map on the polygon
        const bounds = polygon.getBounds();
        if(bounds.isValid()) {
            map.fitBounds(bounds);
        }
        else{
            map.setView([0,0], ZOOM_LEVEL);
            toast.error("Invalid polygon coordinates, unable to fit bounds, in polygon: " + initialZoneData.name);
        }
      }
    }

    return () => {
      map.remove();
    };
  }, [initialZoneData]); // Add initialZoneData to dependencies

  // Add new useEffect to handle control changes
  useEffect(() => {
    if (!mapRefInstance.current || !drawControlRef.current) return;

    // Remove existing draw control
    mapRefInstance.current.removeControl(drawControlRef.current);

    const editObject = editing ? {
        featureGroup: drawnItemsRef.current,
        remove: true
      } : false;
    // Create new draw control with updated options
    const newDrawControl = new L.Control.Draw({
      draw: controls,
      edit: editObject
    });

    // Add new draw control
    mapRefInstance.current.addControl(newDrawControl);
    drawControlRef.current = newDrawControl;

  }, [controls]); // Watch for changes in controls prop



  return (
    <>
      <div id="map" ref={mapRef} style={{ height: '100%', width: '100%' }} />
      <div className="flex flex-col gap-2 p-4">
        <div className="relative flex items-center">
          <Input
            type="text"
            value={cityQuery}
            onChange={(e) => {
              const value = e.target.value;
              setCityQuery(value);
                        }}
            onKeyPress={(e)=>{
                if(e.key === 'Enter') {
                    e.preventDefault();
                    handleCitySearch();
                }
            }}
            placeholder="Enter city..."
            className="w-1/3"
          />
          <Button
            onClick={handleCitySearch}
            className="ml-2"
            size="icon"
            variant="ghost"
            disabled={isLoadingCities}
          >
            {isLoadingCities ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
          {showCitySuggestions && (
            <div className="absolute z-20 w-2/3 bg-white shadow-lg rounded-md mt-1 mb-3 overflow-y-auto max-h-[160px] top-full">
              {isLoadingCities ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2">Searching cities...</p>
                </div>
              ) : citySuggestions.length > 0 ? (
                citySuggestions.map((city, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setCityQuery(city.display_name.split(',')[0]);
                      setShowCitySuggestions(false);
                    }}
                  >
                    {city.display_name}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">No cities found</div>
              )}
            </div>
          )}
        </div>
        <div className="relative ">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
              console.log(e.target.value)
              if (cityQuery.trim()) {
                // handleSearch();
              }
            }}
            placeholder="Search places..."
            className="w-1/3 "
          />

          {showSuggestions && (
            <div className="absolute z-10 w-2/3 bg-white shadow-lg rounded-md mt-1 mb-3 overflow-y-auto max-h-[160px]">
              {isLoadingPlaces ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2">Searching places...</p>
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSearchQuery(suggestion.name);
                      setShowSuggestions(false);
                      console.log("Selected place:", suggestion);
                      mapRefInstance.current.setView([suggestion.geocodes.main.latitude, suggestion.geocodes.main.longitude], ZOOM_LEVEL);
                      addCircleMarker(suggestion.geocodes.main.latitude, suggestion.geocodes.main.longitude, suggestion.name);
                    }}
                  >
                    {suggestion.name}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">No places found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MapComponent; 