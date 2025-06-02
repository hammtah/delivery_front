'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function CreateDriver() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    email: '',
    password: '',
    phone: '',
    type: 'both',
    restaurants: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setIsLoadingRestaurants(true);
      const response = await fetch('http://127.0.0.1:8000/api/restaurant',
        {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      const data = await response.json();
      setRestaurants(data.data);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      setError('Failed to load restaurants');
    } finally {
      setIsLoadingRestaurants(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRestaurantToggle = (restaurantId) => {
    setFormData(prev => ({
      ...prev,
      restaurants: prev.restaurants.includes(restaurantId)
        ? prev.restaurants.filter(id => id !== restaurantId)
        : [...prev.restaurants, restaurantId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/driver', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("token")}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to create driver');
      }

      router.push('/restaurants-owner/drivers');
    } catch (error) {
      console.error('Error creating driver:', error);
      setError('Failed to create driver');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 w-[70%]">
      <h1 className="text-2xl font-bold mb-6">Create New Driver</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
              <CardDescription>Enter the driver&apos;s details below</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image</Label>
                    <Input
                      id="image"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Driver Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="per_delivery">Per Delivery</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Select Restaurants</Label>
                  <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto min-h-[100px] p-4 border rounded-md">
                    {isLoadingRestaurants ? (
                      <div className="col-span-2 flex items-center justify-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Loading restaurants...</p>
                        </div>
                      </div>
                    ) : restaurants.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-muted-foreground">
                        No restaurants found
                      </div>
                    ) : (
                      restaurants.map((restaurant) => (
                        <div key={restaurant.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`restaurant-${restaurant.id}`}
                            checked={formData.restaurants.includes(restaurant.id)}
                            onCheckedChange={() => handleRestaurantToggle(restaurant.id)}
                          />
                          <Label htmlFor={`restaurant-${restaurant.id}`}>
                            {restaurant.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || isLoadingRestaurants}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Driver'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 