"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {CircleDollarSign, MapPin, Clock, Package, User, Navigation, Menu, Home, History, Settings, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { getApiUrl } from "@/utils/api";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

export default function DriverPage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(false);
  const [currentDeliveries, setCurrentDeliveries] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [deliveryHistory, setDeliveryHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(true);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // PWA Installation prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to driver login
      router.push('/driver/login');
      return;
    }

    // Check if user is a driver
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'driver') {
      toast.error('Access denied. Driver account required.');
      router.push('/driver/login');
      return;
    }

    fetchDriverData();
  }, [router]);

  const fetchDriverData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCurrentDeliveries(),
        fetchAvailableDeliveries(),
        fetchDeliveryHistory()
      ]);
    } catch (error) {
      console.error('Error fetching driver data:', error);
      toast.error('Failed to load driver data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentDeliveries = async () => {
    try {
      const response = await fetch(getApiUrl('/api/driver/current-deliveries'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Expecting an array of deliveries
        // setCurrentDeliveries(Array.isArray(data.data) ? data.data : (data.data ? [data.data] : []));
        setCurrentDeliveries(Array.isArray(data) ? data : (data ? [data] : []));
      } else if (response.status === 404) {
        setCurrentDeliveries([]);
      }
    } catch (error) {
      console.error('Error fetching current deliveries:', error);
    }
  };

  const fetchAvailableDeliveries = async () => {
    try {
      setLoadingDeliveries(true);
      const response = await fetch(getApiUrl('/api/driver/available-deliveries'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        // setDeliveries(data.data || []);
        setDeliveries(data || []);
      }
    } catch (error) {
      console.error('Error fetching available deliveries:', error);
      toast.error('Failed to load available deliveries');
    } finally {
      setLoadingDeliveries(false);
    }
  };

  const fetchDeliveryHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch(getApiUrl('/api/driver/delivery-history'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDeliveryHistory(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching delivery history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const acceptDelivery = async (deliveryId) => {
    try {
      const response = await fetch(getApiUrl(`/api/driver/accept-delivery/${deliveryId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Delivery accepted successfully!');
        // Refresh data
        await fetchDriverData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept delivery');
      }
    } catch (error) {
      console.error('Error accepting delivery:', error);
      toast.error(error.message || 'Failed to accept delivery');
    }
  };

  const updateOnlineStatus = async (status) => {
    try {
      const response = await fetch(getApiUrl('/api/driver/availability'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: status ? 'online' : 'offline' })
      });

      if (response.ok) {
        setIsOnline(status);
        toast.success(status ? 'You are now online' : 'You are now offline');
      } else {
        throw new Error('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating online status:', error);
      toast.error('Failed to update online status');
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      setDeferredPrompt(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { variant: 'secondary', label: 'Pending' },
      'assigned': { variant: 'default', label: 'Assigned' },
      'in_progress': { variant: 'default', label: 'In Progress' },
      'completed': { variant: 'default', label: 'Completed' },
      'cancelled': { variant: 'destructive', label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading driver data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-background border-b z-50">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Driver App</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              onClick={() => updateOnlineStatus(!isOnline)}
              variant={isOnline ? "default" : "secondary"}
              size="sm"
            >
              {isOnline ? "Online" : "Offline"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-16 px-4 space-y-4">
        {activeTab === 'home' && (
          <>
            {/* Current Deliveries Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                {currentDeliveries.length > 0 ? (
                  <div className="space-y-4">
                    {currentDeliveries.map((delivery) => (
                      <div key={delivery.id} className="space-y-3 p-3 border rounded-lg bg-card">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-primary" />
                          <span className="font-medium">{delivery.restaurant?.name || 'Restaurant'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-primary" />
                          <span>{delivery.client?.user?.name || 'Customer'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          <span>{delivery.address?.street}, {delivery.address?.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-primary" />
                          <span>Expected: {new Date(delivery.etime_arrival).toLocaleTimeString()}</span>
                        </div>
                        <Button className="w-full mt-2">
                          <Navigation className="mr-2 h-4 w-4" />
                          Navigate
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No active deliveries</p>
                )}
              </CardContent>
            </Card>

            {/* Available Deliveries */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Available Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingDeliveries ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : deliveries.length > 0 ? (
                  <div className="space-y-3">
                    {deliveries.map((delivery) => (
                      <div
                        key={delivery.id}
                        className="p-3 border rounded-lg space-y-2 bg-card"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{delivery.restaurant?.name || 'Restaurant'}</h3>
                            <p className="text-sm text-muted-foreground">
                              {delivery.client?.user?.name || 'Customer'}
                            </p>
                          </div>
                          {getStatusBadge(delivery.status)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{delivery.address?.street}, {delivery.address?.city}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>Expected: {new Date(delivery.etime_arrival).toLocaleTimeString()}</span>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => acceptDelivery(delivery.id)}
                        >
                          Accept Delivery
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No available deliveries</p>
                )}
              </CardContent>
            </Card>

            {/* Map View */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Navigation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Map View (Integration Pending)</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === 'history' && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Delivery History</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingHistory ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : deliveryHistory.length > 0 ? (
                <div className="space-y-3">
                  {deliveryHistory.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="p-3 border rounded-lg space-y-2 bg-card"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{delivery.restaurant?.name || 'Restaurant'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {delivery.client?.user?.name || 'Customer'}
                          </p>
                        </div>
                        {getStatusBadge(delivery.status)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{delivery.address?.street}, {delivery.address?.city}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Completed: {new Date(delivery.rtime_arrival).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No delivery history yet</p>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'payment' && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Payment & Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Today's Earnings</h3>
                  <p className="text-2xl font-bold text-primary">$0.00</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">This Week</h3>
                  <p className="text-2xl font-bold text-primary">$0.00</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">This Month</h3>
                  <p className="text-2xl font-bold text-primary">$0.00</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleInstallClick}
                >
                  Install App
                </Button>
                <Button variant="outline" className="w-full">
                  Notifications
                </Button>
                <Button variant="outline" className="w-full">
                  Profile Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center w-full h-full ${
              activeTab === 'home' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center w-full h-full ${
              activeTab === 'history' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <History className="h-6 w-6" />
            <span className="text-xs mt-1">History</span>
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex flex-col items-center justify-center w-full h-full ${
              activeTab === 'payment' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <CircleDollarSign className="h-6 w-6" />
            <span className="text-xs mt-1">Payment</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center w-full h-full ${
              activeTab === 'settings' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
} 