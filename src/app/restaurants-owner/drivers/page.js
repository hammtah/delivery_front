'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Mail, Phone } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";

const statusColors = {
  online: 'bg-green-700',
  offline: 'bg-gray-700',
  busy: 'bg-yellow-700',
  suspended: 'bg-red-700'
};

const statusLabels = {
  online: 'Active',
  offline: 'Offline',
  busy: 'Busy',
  suspended: 'Suspended'
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [driverToSuspend, setDriverToSuspend] = useState(null);
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/driver', {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = await response.json();
      setDrivers(data.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setError('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendClick = (driver) => {
    setDriverToSuspend(driver);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmSuspend = async () => {
    if (!driverToSuspend) return;
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/driver/${driverToSuspend.id}/suspend`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to suspend driver');
      }

      fetchDrivers();

    } catch (error) {
      console.error('Error suspending driver:', error);
      setError('Failed to suspend driver');
    } finally {
      setIsConfirmDialogOpen(false);
      setDriverToSuspend(null);
    }
  };

  const unsuspend = async (driver) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/driver/${driver.id}/unsuspend`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to unsuspend driver');
      }

      fetchDrivers();

    } catch (error) {
      console.error('Error unsuspending driver:', error);
      setError('Failed to unsuspend driver');
    } finally {
    }
  };

  const handleAvailabilityChange = async (driverId, isOnline) => {
    // Optimistically update the UI
    setDrivers(prevDrivers =>
      prevDrivers.map(driver =>
        driver.id === driverId ? { ...driver, status: isOnline ? 'online' : 'offline' } : driver
      )
    );

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/driver/${driverId}/availability`, {
        method: 'PUT', // Assuming POST based on previous endpoint usage
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`
        },
        // You might need a body here depending on the API definition,
        // e.g., body: JSON.stringify({ is_online: isOnline })
      });

      if (!response.ok) {
        // Revert UI on error
        setDrivers(prevDrivers =>
          prevDrivers.map(driver =>
            driver.id === driverId ? { ...driver, status: isOnline ? 'offline' : 'online' } : driver
          )
        );
        throw new Error('Failed to update driver availability');
      }

      // API success, no need to re-fetch the whole list if API response confirms state
      // If API response doesn't confirm state, you might need to fetchDrivers() again

    } catch (error) {
      console.error('Error updating availability:', error);
      setError('Failed to update availability');
    }
  };

  // Filter drivers based on search term and active tab (placeholder)
  const filteredDrivers = drivers.filter(driver => {
    const searchTermMatch = driver.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          driver.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          driver.user.phone.includes(searchTerm);

    const statusMatch = activeTab === 'all' || driver.status === activeTab;

    return searchTermMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading drivers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-destructive">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Drivers</h1>
        <p className="text-gray-600">Manage all delivery drivers on the platform</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search drivers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          {/* Placeholder for actual filtering/sorting controls */}
        </div>
        <Link href="/restaurants-owner/drivers/create">
          <Button>
            + Add Driver
          </Button>
        </Link>
      </div>

      {/* Placeholder Tabs for filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Drivers</TabsTrigger>
          <TabsTrigger value="online">Active</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
          <TabsTrigger value="offline">Inactive</TabsTrigger>
           {/* Add other statuses like 'busy' if needed */}
        </TabsList>
      </Tabs>

      {filteredDrivers.length === 0 ? (
        <div className='flex flex-col items-center justify-center mt-16'>
          <Image src='/no_driver.png' alt='empty' width={100} height={100} className='w-64 h-32 object-contain' />
          <h1 className='text-2xl font-bold text-gray-800 mt-4'>No drivers found</h1>
          {drivers.length > 0 && <p className='text-gray-600 text-sm mb-4'>Adjust your search or filters.</p>}
          {drivers.length === 0 && <p className='text-gray-600 text-sm mb-4'>Please add a driver to get started</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <Card key={driver.id} className="overflow-hidden hover:shadow-lg transition-shadow relative">
              <div className="p-6 flex items-center gap-4">
                {/* Placeholder for driver image */}
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                   {/* In a real app, you would load the driver's image here */}
                   <img
                     src={driver.user.image || '/driver_placeholder.png'}
                     alt={driver.user.name}
                     width={64}
                     height={64}
                     className="rounded-full object-cover w-[100%] h-[100%]"
                   />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800">{driver.user.name}</h2>
                  <p className="text-sm text-gray-600 capitalize">{driver.type.replace('_', ' ')}</p>
                </div>
                {driver.status === 'online' || driver.status === 'offline' ? (
                   <div className="flex flex-col items-center gap-1">
                      <Switch
                         checked={driver.status === 'online'}
                         onCheckedChange={(isChecked) => handleAvailabilityChange(driver.id, isChecked)}
                      />
                      <span className="text-xs text-gray-500">
                         {statusLabels[driver.status] || driver.status}
                      </span>
                   </div>
                ) : (
                  <Badge 
                    variant="secondary" 
                    className={`${statusColors[driver.status] || 'bg-gray-500'} text-white`}
                  >
                    {statusLabels[driver.status] || driver.status}
                  </Badge>
                )}
              </div>

              <CardContent className="px-6 pt-4 space-y-2 text-sm text-gray-600">
                 <p className="flex items-center gap-2"><Mail size={16} />{driver.user.email}</p>
                 <p className="flex items-center gap-2"><Phone size={16} />{driver.user.phone}</p>
                 {/* Address is not available in API response */}
              </CardContent>

              <div className="px-6 pb-12 space-x-2">
                 <span className='text-sm text-gray-600'>Restaurants: </span>
                 {driver.restaurants && driver.restaurants.map(restaurant => (
                     <Badge key={restaurant.id} variant="outline">{restaurant.name}</Badge>
                 ))}
              </div>

              <div className="absolute bottom-4 right-4 flex justify-end gap-4">
                 <Button variant="outline" size="sm">
                     Edit
                 </Button>
                 {driver.status !== 'suspended' ? (
                    <Button className='bg-red-700 hover:bg-red-800' size="sm" onClick={() => handleSuspendClick(driver)}>
                         Suspend
                    </Button>
                 ) : (
                    <Button size="sm" onClick={() => unsuspend(driver)}>
                        Activate
                    </Button>
                 )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog for Suspend */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will suspend the driver {driverToSuspend?.user?.name || ''}. They will not be able to receive new orders.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSuspend}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 