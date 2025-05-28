'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

const MapComponent = ({ addressForm, setAddressForm }) => {
  const mapRef = useRef(null);

  const getAddressDetails = async (c) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${c.lat}&lon=${c.lng}`
      );
      const data = await response.json();
      const address = data.address;
      console.log(address);
      if (address) {
        const city = address.city || address.town || address.village || address.county;
        // if (city) {
        setAddressForm(prev => ({
          ...prev,
          city: address.city,
          neighborhood: address.neighbourhood,
          street_code: address.street_code,
          postal_code: address.postcode,
          province: address.state_district,
          position: {
            name: city,
            longitude: c.lng,
            latitude: c.lat
          }
        }));
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
  };

  const polygonHandler = (layer) => {
    const latlngs = layer.getLatLngs()[0];
    const coordinates = latlngs.map(latlng => ({
      lat: latlng.lat,
      lng: latlng.lng
    }));
    console.log("Polygon Coordinates:", coordinates);
  };

  const markerHandler = (layer) => {
    const latlng = layer.getLatLng();
    console.log("Marker Coordinates:", latlng);
    getAddressDetails({ lat: latlng.lat, lng: latlng.lng });
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Fix Leaflet default icon issue
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    const map = L.map(mapRef.current).setView([40.7128, -74.0060], 13);
    
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // Initialize the draw control and pass it the FeatureGroup of editable layers
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: true,
        polyline: false,
        rectangle: false,
        marker: true,
        circle: true,
        circlemarker: false
      },
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, function (event) {
      const layer = event.layer;
      if (drawnItems.getLayers().length >= 2) {
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

    map.on(L.Draw.Event.EDITED, function (event) {
      const layers = event.layers;
      layers.eachLayer(function (layer) {
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
    });

    map.on(L.Draw.Event.DELETED, function (e) {
      drawnItems.clearLayers();
    });

    return () => {
      map.remove();
    };
  }, [setAddressForm]);

  return (
    <div id="map" ref={mapRef} style={{ height: '80vh', width: '60vw' }} />
  );
};

export default MapComponent; 