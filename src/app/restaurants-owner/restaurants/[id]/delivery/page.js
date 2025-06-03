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
import { User, Phone, Mail, MapPin, Search, Home, Building2, Navigation, CircleDot, Plus, Minus, Clock, AlertCircleIcon  } from "lucide-react";
import Image from "next/image";

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
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const [commissions, setCommissions] = useState({
    full_commission: {},
    partial_commission: {},
    user_fees: {}
  });
  const [loadingCommissions, setLoadingCommissions] = useState(false);

  const [selectedZones, setSelectedZones] = useState({
    full_commission: 'default',
    partial_commission: 'default',
    user_fees: 'default'
  });

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
    fetchItems();
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

  const fetchAvailableDrivers = async () => {
    setLoadingDrivers(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/restaurant/${params.id}/available-drivers`, {
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
      console.log(data.data)
      setDrivers(data.data);
    } catch (error) {
      toast.error('Failed to fetch available drivers: ' + error.message);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchItems = async () => {
    setLoadingItems(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/item`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      
      const data = await response.json();
      setItems(data.data);
    } catch (error) {
      toast.error('Failed to fetch items: ' + error.message);
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchCommissions = async (addressId) => {
    setLoadingCommissions(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/restaurant/${params.id}/address/${addressId}/commission`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch commissions');
      }
      
      const data = await response.json();
      setCommissions(data);
      
      // Set initial values in formData
      const defaultFullCommission = Object.values(data.full_commission)[0] || 0;
      const defaultPartialCommission = Object.values(data.partial_commission)[0] || 0;
      const defaultFees = Object.values(data.user_fees)[0] || 0;
      
      setFormData(prev => ({
        ...prev,
        full_commission: defaultFullCommission,
        partial_commission: defaultPartialCommission,
        fees: defaultFees
      }));

      // Reset selected zones to default
      setSelectedZones({
        full_commission: 'default',
        partial_commission: 'default',
        user_fees: 'default'
      });
    } catch (error) {
      toast.error('Failed to fetch commissions: ' + error.message);
    } finally {
      setLoadingCommissions(false);
    }
  };

  const handleZoneChange = (type, zone) => {
    setSelectedZones(prev => ({ ...prev, [type]: zone }));
    
    // Map the commission type to the correct form data field
    const formFieldMap = {
      full_commission: 'full_commission',
      partial_commission: 'partial_commission',
      user_fees: 'fees'
    };

    const formField = formFieldMap[type];
    if (formField) {
      setFormData(prev => ({
        ...prev,
        [formField]: commissions[type][zone] || 0
      }));
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
    fetchCommissions(addressId);
    fetchAvailableDrivers();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Replace with actual API call
      console.log("Submitting delivery:", formData);
      fetch(`http://127.0.0.1:8000/api/delivery`,{
        'method': 'POST',
        'body': JSON.stringify(formData),
        headers:{
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
      })
    //   router.push(`/restaurants-owner/restaurants/${params.id}`);
    } catch (err) {
      setError(err.message || "Failed to create delivery");
    } finally {
      setLoading(false);
    }
  };

  const handleItemQuantityChange = (itemId, change) => {
    setFormData(prev => {
      const existingItem = prev.items.find(item => item.id === itemId);
      const newQuantity = (existingItem?.quantity || 0) + change;
      
      if (newQuantity <= 0) {
        return {
          ...prev,
          items: prev.items.filter(item => item.id !== itemId)
        };
      }

      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map(item =>
            item.id === itemId ? { ...item, quantity: newQuantity } : item
          )
        };
      }

      return {
        ...prev,
        items: [...prev.items, { id: itemId, quantity: newQuantity }]
      };
    });
  };

  const getItemQuantity = (itemId) => {
    return formData.items.find(item => item.id === itemId)?.quantity || 0;
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

              {formData.client_id && formData.address_id && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Available Drivers</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fetchAvailableDrivers}
                      disabled={loadingDrivers}
                    >
                      {loadingDrivers ? "Refreshing..." : "Refresh Drivers"}
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {drivers.map(driver => (
                      <div
                        key={driver.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          formData.driver_id === driver.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:border-primary/50'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, driver_id: driver.id }))}
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                              {driver.user.image ? (
                                <img
                                  src={driver.user.image}
                                  alt={driver.user.name}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                  <User className="h-6 w-6 text-primary" />
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1">
                              <div className={`w-3 h-3 rounded-full border-2 border-white ${
                                driver.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div>
                              <h3 className="font-semibold">{driver.user.name}</h3>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span className="capitalize">{driver.type.replace('_', ' ')}</span>
                                <span>•</span>
                                <span className="capitalize">{driver.status}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">{driver.user.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-600">{driver.user.email}</span>
                              </div>
                            </div>
                            {driver.distance_to_restaurant && (
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Navigation className="h-4 w-4" />
                                <span>{driver.distance_to_restaurant.toFixed(1)} km from restaurant</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {drivers.length === 0 && !loadingDrivers && (
                      <div className="p-4 border rounded-lg text-center text-gray-500">
                        No drivers available at the moment
                      </div>
                    )}
                    {loadingDrivers && (
                      <div className="p-4 border rounded-lg text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Items</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={fetchItems}
                  disabled={loadingItems}
                >
                  {loadingItems ? "Refreshing..." : "Refresh Items"}
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search items..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map(item => (
                  <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/10">
                          <span className="text-2xl text-primary">🍽️</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold truncate">{item.name}</h3>
                          <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                          {item.prep_time && (
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <Clock className="h-4 w-4" />
                              <span>{item.prep_time} min</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleItemQuantityChange(item.id, -1)}
                            disabled={getItemQuantity(item.id) === 0}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center">{getItemQuantity(item.id)}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleItemQuantityChange(item.id, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredItems.length === 0 && !loadingItems && (
                  <div className="col-span-2 p-4 border rounded-lg text-center text-gray-500">
                    No items found
                  </div>
                )}
                {loadingItems && (
                  <div className="col-span-2 p-4 border rounded-lg text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Commissions & Fees</Label>
              {Object.keys(commissions.full_commission).length === 1 && 
               Object.keys(commissions.full_commission)[0] === 'default' && (
                <Alert className="mb-4">
                  <AlertCircleIcon />
                  <AlertDescription>
                  These are the default restaurant settings values. You can modify them in the restaurant settings.
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_commission">Full Commission</Label>
                  <div className="space-y-2">
                    <Select
                      value={selectedZones.full_commission}
                      onValueChange={(value) => handleZoneChange('full_commission', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(commissions.full_commission).map(([zone, value]) => (
                          <SelectItem key={zone} value={zone}>
                            {zone === 'default' ? 'Default' : `Zone ${zone}`} ({value}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Input
                        id="full_commission"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.full_commission}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_commission: parseFloat(e.target.value) || 0 }))}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="partial_commission">Partial Commission</Label>
                  <div className="space-y-2">
                    <Select
                      value={selectedZones.partial_commission}
                      onValueChange={(value) => handleZoneChange('partial_commission', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(commissions.partial_commission).map(([zone, value]) => (
                          <SelectItem key={zone} value={zone}>
                            {zone === 'default' ? 'Default' : `Zone ${zone}`} ({value}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Input
                        id="partial_commission"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.partial_commission}
                        onChange={(e) => setFormData(prev => ({ ...prev, partial_commission: parseFloat(e.target.value) || 0 }))}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fees">Fees</Label>
                  <div className="space-y-2">
                    <Select
                      value={selectedZones.user_fees}
                      onValueChange={(value) => handleZoneChange('user_fees', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(commissions.user_fees).map(([zone, value]) => (
                          <SelectItem key={zone} value={zone}>
                            {zone === 'default' ? 'Default' : `Zone ${zone}`} (${value})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="relative">
                      <Input
                        id="fees"
                        type="number"
                        min="0"
                        value={formData.fees}
                        onChange={(e) => setFormData(prev => ({ ...prev, fees: parseFloat(e.target.value) || 0 }))}
                        className="pl-8"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    </div>
                  </div>
                </div>
              </div>
              {loadingCommissions && (
                <div className="text-sm text-gray-500">
                  Loading commission data...
                </div>
              )}
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
