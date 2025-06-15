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
import { Loader2 } from "lucide-react";
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

export default function DeliveriesPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [deliveryToCancel, setDeliveryToCancel] = useState(null);

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

  const getStatusBadge = (status) => {
    const statusColors = {
      assigned: 'bg-blue-500',
      picked_up: 'bg-yellow-500',
      delivered: 'bg-green-500',
      cancelled: 'bg-red-500'
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
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeliveryToCancel(delivery.id)}
                        >
                          Cancel
                        </Button>
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
