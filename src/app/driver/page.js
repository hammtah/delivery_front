"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {CircleDollarSign, MapPin, Clock, Package, User, Navigation, Menu, Home, History, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DriverPage() {
  const [isOnline, setIsOnline] = useState(false);
  const [currentDelivery, setCurrentDelivery] = useState(null);
  const [activeTab, setActiveTab] = useState('home');

  // Mock data for demonstration
  const mockDeliveries = [
    {
      id: 1,
      restaurant: "Burger King",
      customer: "John Doe",
      address: "123 Main St, City",
      status: "pending",
      time: "15 mins",
    },
    {
      id: 2,
      restaurant: "Pizza Hut",
      customer: "Jane Smith",
      address: "456 Oak Ave, City",
      status: "assigned",
      time: "25 mins",
    },
  ];

  // PWA Installation prompt
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

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

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-background border-b z-50">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Driver App</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              onClick={() => setIsOnline(!isOnline)}
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
            {/* Current Delivery Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Delivery</CardTitle>
              </CardHeader>
              <CardContent>
                {currentDelivery ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      <span className="font-medium">{currentDelivery.restaurant}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      <span>{currentDelivery.customer}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <span>{currentDelivery.address}</span>
                    </div>
                    <Button className="w-full mt-2">
                      <Navigation className="mr-2 h-4 w-4" />
                      Navigate
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No active delivery</p>
                )}
              </CardContent>
            </Card>

            {/* Assigned Deliveries */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">New Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockDeliveries.map((delivery) => (
                    <div
                      key={delivery.id}
                      className="p-3 border rounded-lg space-y-2 bg-card"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{delivery.restaurant}</h3>
                          <p className="text-sm text-muted-foreground">
                            {delivery.customer}
                          </p>
                        </div>
                        <Badge variant={delivery.status === "pending" ? "secondary" : "default"}>
                          {delivery.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{delivery.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{delivery.time}</span>
                      </div>
                      {/* <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setCurrentDelivery(delivery)}
                      >
                        Accept Delivery
                      </Button> */}
                    </div>
                  ))}
                </div>
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
              <p className="text-muted-foreground text-center py-4">No delivery history yet</p>
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
            onClick={() => setActiveTab('Paiment')}
            className={`flex flex-col items-center justify-center w-full h-full ${
              activeTab === 'Paiment' ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <CircleDollarSign className="h-6 w-6" />
            <span className="text-xs mt-1">Paiment</span>
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