"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { User, Phone, Mail, MapPin, Search, Home, Building2 } from "lucide-react";

export default function CreateDeliveryPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    client_id: "",
    restaurant_id: parseInt(params.id),
    address_id: "",
    items: [],
    full_commission: 0,
    partial_commission: 0,
    payment_type: "cod",
    type: "asap",
    fees: 0,
    driver_id: "",
    note: ""
  });

  const [clients, setClients] = useState([]);
  const [clientAddresses, setClientAddresses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/client', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        
        const data = await response.json();
        setClients(data.data);
      } catch (error) {
        toast.error('Failed to fetch clients: ' + error.message);
      }
    };

    fetchClients();
    // TODO: Replace with actual API calls for drivers and items
    setDrivers([{ id: 519, name: "Driver 1" }]);
    setItems([
      { id: 1, name: "Item 1", price: 10 },
      { id: 5, name: "Item 2", price: 15 }
    ]);
  }, []);

  const fetchClientAddresses = async (clientId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/client/${clientId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch client addresses');
      }
      
      const data = await response.json();
      setClientAddresses(data.data.addresses || []);
    } catch (error) {
      toast.error('Failed to fetch client addresses: ' + error.message);
    }
  };

  const filteredClients = clients.filter(client => 
    client.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.user.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClientSelect = (clientId) => {
    setFormData(prev => ({ ...prev, client_id: parseInt(clientId), address_id: "" }));
    fetchClientAddresses(clientId);
  };

  const handleAddressSelect = (addressId) => {
    setFormData(prev => ({ ...prev, address_id: parseInt(addressId) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Replace with actual API call
      console.log("Submitting delivery:", formData);
      router.push(`/restaurants-owner/restaurants/${params.id}`);
    } catch (err) {
      setError(err.message || "Failed to create delivery");
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (itemId, quantity) => {
    setFormData(prev => {
      const existingItem = prev.items.find(item => item.id === itemId);
      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
        };
      }
      return {
        ...prev,
        items: [...prev.items, { id: itemId, quantity }]
      };
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create New Delivery</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Client</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search clients by name, email, or phone..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto mt-2">
                  {filteredClients.map(client => (
                    <div
                      key={client.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.client_id === client.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/50'
                      }`}
                      onClick={() => handleClientSelect(client.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="font-semibold">{client.user.name}</h3>
                            <p className="text-sm text-gray-500">ID: {client.id}</p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{client.user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{client.user.phone}</span>
                            </div>
                            {client.addresses?.length > 0 && (
                              <div className="flex items-center gap-2 col-span-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">
                                  {client.addresses.length} Address{client.addresses.length !== 1 ? 'es' : ''}
                                </span>
                              </div>
                            )}
                          </div>
                          {client.note && (
                            <p className="text-sm text-gray-500 line-clamp-2">
                              <span className="font-medium">Note:</span> {client.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {formData.client_id && (
                <div className="space-y-2">
                  <Label>Client&apos;s Address</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {clientAddresses.map(address => (
                      <div
                        key={address.address_id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.address_id === address.address_id
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => handleAddressSelect(address.address_id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="bg-primary/10 p-2 rounded-full">
                            {address.name?.toLowerCase().includes('work') ? (
                              <Building2 className="h-5 w-5 text-primary" />
                            ) : (
                              <Home className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div>
                              <h3 className="font-semibold">{address.name || 'Home'}</h3>
                              <p className="text-sm text-gray-500">
                                {address.street && `${address.street}, `}
                                {address.neighberhood && `${address.neighberhood}, `}
                                {address.city}, {address.province}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {address.postal_code && (
                                <span>Postal Code: {address.postal_code}</span>
                              )}
                              {address.street_code && (
                                <span>Street Code: {address.street_code}</span>
                              )}
                            </div>
                            {address.geoPosition && (
                              <div className="text-sm text-gray-500">
                                <span className="font-medium">Location:</span> {address.geoPosition.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {clientAddresses.length === 0 && (
                      <div className="p-4 border rounded-lg text-center text-gray-500">
                        No addresses found for this client
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="driver">Driver</Label>
                <Select
                  value={formData.driver_id.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, driver_id: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map(driver => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Items</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">${item.price}</p>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      value={formData.items.find(i => i.id === item.id)?.quantity || 0}
                      onChange={(e) => handleItemChange(item.id, parseInt(e.target.value))}
                      className="w-20"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payment_type">Payment Type</Label>
                <Select
                  value={formData.payment_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, payment_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cod">Cash on Delivery</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Delivery Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP</SelectItem>
                    <SelectItem value="schedule">Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Delivery Note</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Add any special instructions for the delivery..."
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Delivery"}
          </Button>
        </div>
      </form>
    </div>
  );
}
