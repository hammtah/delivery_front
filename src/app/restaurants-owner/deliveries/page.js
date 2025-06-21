'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/utils/api';
import { redirect } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import { Loader2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import DriverCard from "@/components/DriverCard";

export default function DeliveriesPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [deliveryToCancel, setDeliveryToCancel] = useState(null);
  const [deliveryToAffect, setDeliveryToAffect] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [affectingDelivery, setAffectingDelivery] = useState(false);

  if (localStorage.getItem('token') == null) {
    redirect('/restaurants-owner/login');
  }

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchDeliveries(selectedRestaurant);
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(getApiUrl('/api/restaurant'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      const data = await response.json();
      setRestaurants(data.data);
      if (data.data.length > 0) {
        setSelectedRestaurant(data.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDeliveries = async (restaurantId) => {
    try {
      setLoadingDeliveries(true);
      const response = await fetch(getApiUrl(`/api/restaurant/${restaurantId}/deliveries`), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch deliveries');
      }
      const data = await response.json();
      setDeliveries(data.data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoadingDeliveries(false);
    }
  };

  const cancelDelivery = async (deliveryId) => {
    try {
      const response = await fetch(getApiUrl(`/api/delivery/${deliveryId}/cancel`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel delivery');
      }
      
      // Refetch deliveries after successful cancellation
      if (selectedRestaurant) {
        fetchDeliveries(selectedRestaurant);
      }
    } catch (error) {
      console.error('Error canceling delivery:', error);
    } finally {
      setDeliveryToCancel(null);
    }
  };

  const fetchAvailableDrivers = async () => {
    if (!selectedRestaurant) return;
    
    setLoadingDrivers(true);
    try {
      const response = await fetch(getApiUrl(`/api/restaurant/${selectedRestaurant}/available-drivers`), {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch available drivers');
      }
      
      const data = await response.json();
      setAvailableDrivers(data.data);
    } catch (error) {
      toast.error('Failed to fetch available drivers: ' + error.message);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleAffectToDriver = async () => {
    if (!selectedDriver || !deliveryToAffect) return;
    
    setAffectingDelivery(true);
    try {
      const response = await fetch(getApiUrl(`/api/driver/${selectedDriver.id}/assign-deliveries`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            deliveries: [deliveryToAffect]
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to assign driver to delivery');
      }
      
      toast.success('Driver assigned successfully!');
      
      // Refetch deliveries after successful assignment
      if (selectedRestaurant) {
        fetchDeliveries(selectedRestaurant);
      }
      
      // Close dialog and reset state
      setDeliveryToAffect(null);
      setSelectedDriver(null);
    } catch (error) {
      toast.error('Failed to assign driver: ' + error.message);
    } finally {
      setAffectingDelivery(false);
    }
  };

  const openAffectDriverDialog = (deliveryId) => {
    setDeliveryToAffect(deliveryId);
    setSelectedDriver(null);
    fetchAvailableDrivers();
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      assigned: 'bg-blue-500',
      picked_up: 'bg-yellow-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500',
      pending: 'bg-orange-500',
      problem: 'bg-red-600'
    };

    return (
      <Badge className={`${statusColors[status] || 'bg-gray-500'} text-white`}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading && !selectedRestaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 ml-0 md:ml-64 max-w-[1200px] mx-auto">
      <AlertDialog open={!!deliveryToCancel} onOpenChange={() => setDeliveryToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to cancel this delivery?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently cancel the delivery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deliveryToCancel && cancelDelivery(deliveryToCancel)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, cancel delivery
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!deliveryToAffect} onOpenChange={() => setDeliveryToAffect(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Driver to Delivery</DialogTitle>
            <DialogDescription>
              Select a driver to assign to this delivery.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {loadingDrivers ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
                <span className="text-gray-500">Loading drivers...</span>
              </div>
            ) : availableDrivers.length > 0 ? (
              <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                {availableDrivers.map(driver => (
                  <DriverCard
                    key={driver.id}
                    driver={driver}
                    isSelected={selectedDriver?.id === driver.id}
                    onClick={() => setSelectedDriver(driver)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No drivers are currently available.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeliveryToAffect(null)}
              disabled={affectingDelivery}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAffectToDriver}
              disabled={!selectedDriver || affectingDelivery}
            >
              {affectingDelivery ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Assigning...
                </>
              ) : (
                'Assign Driver'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Deliveries</h1>
        <div className="w-full sm:w-64">
          <Select
            value={selectedRestaurant?.toString()}
            onValueChange={(value) => setSelectedRestaurant(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a restaurant" />
            </SelectTrigger>
            <SelectContent>
              {restaurants.map((restaurant) => (
                <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                  {restaurant.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deliveries List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingDeliveries ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-500 mr-2" />
                      <span className="text-gray-500">Loading deliveries...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : deliveries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No deliveries found
                  </TableCell>
                </TableRow>
              ) : (
                deliveries.map((delivery) => (
                  <TableRow key={delivery.id}>
                    <TableCell>{delivery.id}</TableCell>
                    <TableCell>{getStatusBadge(delivery.status)}</TableCell>
                    <TableCell>
                      {delivery.client?.user?.name || 'N/A'}
                      <br />
                      <span className="text-sm text-gray-500">
                        {delivery.client?.user?.phone || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {delivery.driver?.user?.name || 'N/A'}
                      <br />
                      <span className="text-sm text-gray-500">
                        {delivery.driver?.user?.phone || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {delivery.address?.street}, {delivery.address?.city}
                      <br />
                      <span className="text-sm text-gray-500">
                        {delivery.address?.postal_code}
                      </span>
                    </TableCell>
                    <TableCell>${delivery.total_amount?.toFixed(2)}</TableCell>
                    <TableCell>
                      {delivery.created_at
                        ? format(new Date(delivery.created_at), 'MMM d, yyyy HH:mm')
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {delivery.status !== 'cancelled' && delivery.status !== 'delivered' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {(delivery.status === 'pending' || delivery.status === 'problem') && (
                              <DropdownMenuItem onClick={() => openAffectDriverDialog(delivery.id)}>
                                Affect to Driver
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => setDeliveryToCancel(delivery.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              Cancel
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
