'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useRouter } from 'next/navigation';

const ZonesMapComponent = ({ zones }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const router = useRouter();
  const [hoveredZone, setHoveredZone] = useState(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Fix Leaflet default icon issue
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });

    // Initialize map
    const map = L.map(mapRef.current).setView([40.7128, -74.0060], 13);
    mapInstance.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  useEffect(() => {
    if (!mapInstance.current || !zones) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    // Add new markers for each zone
    zones.forEach(zone => {
      if (zone.type === 'circle') {
        const center = zone.center_address.geoPosition;
        const circle = L.circle([center.latitude, center.longitude], {
          radius: zone.radius,
          color: getZoneColor(zone.status),
          fillColor: getZoneColor(zone.status),
          fillOpacity: 0.2,
          weight: 2
        }).addTo(mapInstance.current);

        // Add pulsing effect
        const pulseCircle = L.circle([center.latitude, center.longitude], {
          radius: zone.radius,
          color: getZoneColor(zone.status),
          fillColor: getZoneColor(zone.status),
          fillOpacity: 0.1,
          weight: 1
        }).addTo(mapInstance.current);

        // Create popup content
        const popupContent = createPopupContent(zone);

        // Add popup
        circle.bindPopup(popupContent);
        pulseCircle.bindPopup(popupContent);

        // Add hover effects
        circle.on('mouseover', () => {
          setHoveredZone(zone);
          circle.setStyle({ fillOpacity: 0.4 });
          pulseCircle.setStyle({ fillOpacity: 0.2 });
        });

        circle.on('mouseout', () => {
          setHoveredZone(null);
          circle.setStyle({ fillOpacity: 0.2 });
          pulseCircle.setStyle({ fillOpacity: 0.1 });
        });

        circle.on('click', () => {
          router.push(`/restaurants-owner/zones/${zone.id}`);
        });

        // Store references
        markersRef.current[zone.id] = [circle, pulseCircle];

        // Animate pulse
        animatePulse(pulseCircle, zone.radius);

      } else if (zone.type === 'polygon') {
        const coordinates = zone.points.map(point => [
          point.geoPosition.latitude,
          point.geoPosition.longitude
        ]);

        const polygon = L.polygon(coordinates, {
          color: getZoneColor(zone.status),
          fillColor: getZoneColor(zone.status),
          fillOpacity: 0.2,
          weight: 2
        }).addTo(mapInstance.current);

        // Create popup content
        const popupContent = createPopupContent(zone);

        // Add popup
        polygon.bindPopup(popupContent);

        // Add hover effects
        polygon.on('mouseover', () => {
          setHoveredZone(zone);
          polygon.setStyle({ fillOpacity: 0.4 });
        });

        polygon.on('mouseout', () => {
          setHoveredZone(null);
          polygon.setStyle({ fillOpacity: 0.2 });
        });

        polygon.on('click', () => {
          router.push(`/restaurants-owner/zones/${zone.id}`);
        });

        // Store reference
        markersRef.current[zone.id] = [polygon];
      }
    });

    // Fit map to show all zones
    if (zones.length > 0) {
      const bounds = L.latLngBounds(
        zones.flatMap(zone => {
          if (zone.type === 'circle') {
            return [[zone.center_address.geoPosition.latitude, zone.center_address.geoPosition.longitude]];
          } else {
            return zone.points.map(point => [point.geoPosition.latitude, point.geoPosition.longitude]);
          }
        })
      );
      mapInstance.current.fitBounds(bounds, { padding: [50, 50] });
    }

  }, [zones, router]);

  const getZoneColor = (status) => {
    switch (status) {
      case 'active':
        return '#22c55e'; // green
      case 'inactive':
        return '#ef4444'; // red
      case 'pending':
        return '#f59e0b'; // yellow
      default:
        return '#3b82f6'; // blue
    }
  };

  const createPopupContent = (zone) => {
    return `
      <div class="p-2">
        <h3 class="font-semibold">${zone.name}</h3>
        <p class="text-sm text-gray-600">${zone.city}</p>
        <div class="mt-2">
          <span class="inline-block px-2 py-1 rounded-full text-xs ${
            zone.status === 'active' ? 'bg-green-100 text-green-800' :
            zone.status === 'inactive' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }">
            ${zone.status}
          </span>
        </div>
        <p class="text-sm mt-2">${zone.restaurants?.length || 0} restaurants</p>
      </div>
    `;
  };

  const animatePulse = (circle, radius) => {
    let currentRadius = radius;
    let growing = true;
    const maxRadius = radius * 1.2;
    const minRadius = radius * 0.8;
    const step = radius * 0.01;

    const animate = () => {
      if (growing) {
        currentRadius += step;
        if (currentRadius >= maxRadius) {
          growing = false;
        }
      } else {
        currentRadius -= step;
        if (currentRadius <= minRadius) {
          growing = true;
        }
      }

      circle.setRadius(currentRadius);
      requestAnimationFrame(animate);
    };

    animate();
  };

  return (
    <div className="relative">
      <div ref={mapRef} className="h-[600px] w-full rounded-lg" />
      {hoveredZone && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
          <h3 className="font-semibold">{hoveredZone.name}</h3>
          <p className="text-sm text-gray-600">{hoveredZone.city}</p>
          <div className="mt-2">
            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
              hoveredZone.status === 'active' ? 'bg-green-100 text-green-800' :
              hoveredZone.status === 'inactive' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {hoveredZone.status}
            </span>
          </div>
          <p className="text-sm mt-2">{hoveredZone.restaurants?.length || 0} restaurants</p>
          <button
            onClick={() => router.push(`/restaurants-owner/zones/${hoveredZone.id}`)}
            className="mt-2 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            View Details
          </button>
        </div>
      )}
    </div>
  );
};

export default ZonesMapComponent; 