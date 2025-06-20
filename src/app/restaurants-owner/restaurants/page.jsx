'use client'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { MapPin, MoreVertical, Pencil, Trash, CalendarClock, Truck } from 'lucide-react';
import GlowingHeartCircle from '@/components/glowing-heart-circle';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import Loading from '@/components/loading';
import { getApiUrl } from '@/utils/api';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
if(localStorage.getItem('token')==null){
  redirect('/restaurants-owner/login')
}
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(getApiUrl('/api/restaurant'),
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
    return <Loading />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 ml-0 md:ml-64 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">My Restaurants</h1>
        <Link href="/restaurants-owner/restaurants/create-restaurant" >
          <Button variant='' className="w-full sm:w-auto">
            Add New Restaurant
          </Button>
        </Link>
      </div>
      {restaurants.length === 0 && (
      <div className='flex flex-col items-center justify-center mt-16 sm:mt-32'>
        <Image src='/no_restaurant.png' alt='empty' width={100} height={100} className='w-48 sm:w-64 h-24 sm:h-32' />
        <h1 className='text-xl sm:text-2xl font-bold text-gray-800 mt-4'>No restaurants found</h1>
        <p className='text-gray-600 text-sm mb-4 text-center max-w-md'>Please create a restaurant to get started</p>
      </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow relative pb-4"
          >
            <div className="relative h-40 sm:h-48">
              <img
                src={restaurant.image || '/restaurant_placeholder.png'}
                alt={restaurant.name}
                fill
                className="object-cover h-full w-full"
              />
            </div>

            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
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

                <div className="flex items-center gap-2">
                  <GlowingHeartCircle size="12px" color={`${restaurant.status === 'active' ? 'green' : 'red'}`}/>
                  <span className="text-sm font-medium text-gray-600">
                    {restaurant.status === 'active' ? 'Open' : 'Closed'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-end items-center absolute bottom-4 right-4 cursor-pointer">
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none cursor-pointer">
                    <MoreVertical className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <Link href={`/restaurants-owner/restaurants/${restaurant.id}/edit`}>
                      <DropdownMenuItem className='cursor-pointer'>
                        <Pencil className='w-4 h-4 mr-2' /> Edit
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className='cursor-pointer'>
                      <Trash className='w-4 h-4 mr-2' 
                    /> Delete
                    </DropdownMenuItem>
                    <Link href={`/restaurants-owner/restaurants/${restaurant.id}/working-hours`}>
                      <DropdownMenuItem className='cursor-pointer'>
                        <CalendarClock className='w-4 h-4 mr-2' /> Working Hours
                      </DropdownMenuItem>
                    </Link>
                    <Link href={`/restaurants-owner/restaurants/${restaurant.id}/delivery`}>
                      <DropdownMenuItem className='cursor-pointer'>
                        <Truck className='w-4 h-4 mr-2' /> Delivery
                      </DropdownMenuItem>
                    </Link>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}