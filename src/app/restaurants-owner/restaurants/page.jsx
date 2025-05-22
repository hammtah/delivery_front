'use client'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import GlowingHeartCircle from '@/components/glowing-heart-circle';
export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/restaurant',
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        const data = await response.json();
        setRestaurants(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    const parts = [
      address.street,
      address.street_code,
      address.city,
      address.province,
      address.postal_code
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Restaurants</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
          Add New Restaurant
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48">
              <Image
                src={restaurant.image || '/placeholder-restaurant.jpg'}
                alt={restaurant.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {restaurant.name}
              </h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {restaurant.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-start text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sm">
                    {formatAddress(restaurant.address)}
                  </span>
                </div>

                <div className="flex items-center gap-2 ">
                  <GlowingHeartCircle size="12px" color={`${restaurant.status === 'active' ? 'green' : 'red'}`}/>
                  <span className="text-sm font-medium text-gray-600">
                    {restaurant.status}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                  Edit
                </button>
                <button className="text-red-500 hover:text-red-600 text-sm font-medium">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 