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
import { User, Phone, Mail, MapPin, Search, Home, Building2, Navigation, CircleDot, Plus, Minus, Clock, AlertCircleIcon, Check } from "lucide-react";
import Image from "next/image";
import { getApiUrl } from '@/utils/api';

export default function CreateDeliveryPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
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

  const steps = [
    { id: 1, title: "Client Details", description: "Select client and delivery address" },
    { id: 2, title: "Order Items", description: "Add items to the delivery" },
    { id: 3, title: "Driver & Settings", description: "Choose driver and delivery settings" },
    { id: 4, title: "Review & Submit", description: "Review and confirm delivery" }
  ];

  const isStepComplete = (stepId) => {
    switch (stepId) {
      case 1:
        return formData.client_id && formData.address_id;
      case 2:
        return formData.items.length > 0;
      case 3:
        return formData.payment_type && formData.type;
      case 4:
        return true; // Review step is always accessible
      default:
        return false;
    }
  };

  const canNavigateToStep = (stepId) => {
    // Can always go back to previous steps
    if (stepId < currentStep) return true;
    
    // Can only go forward if all previous steps are complete
    for (let i = 1; i < stepId; i++) {
      if (!isStepComplete(i)) return false;
    }
    return true;
  };

  const handleStepClick = (stepId) => {
    if (canNavigateToStep(stepId)) {
      setCurrentStep(stepId);
    } else {
      toast.error("Please complete the previous steps first");
    }
  };

  useEffect(() => {
    const fetchClients = async () => {
      setLoadingClients(true);
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
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClients();
    fetchItems();
  }, []);

  const fetchClientAddresses = async (clientId) => {
    setLoadingAddresses(true);
    try {
      const response = await fetch(getApiUrl(`/api/client/${clientId}`), {
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
    } finally {
      setLoadingAddresses(false);
    }
  };

  const fetchAvailableDrivers = async () => {
    setLoadingDrivers(true);
    try {
      const response = await fetch(getApiUrl(`/api/restaurant/${params.id}/available-drivers`), {
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
      setDrivers(data.data);
      
      // Auto-select the first driver if available and no driver is currently selected
      if (data.data.length > 0 && !formData.driver_id) {
        setFormData(prev => ({ ...prev, driver_id: data.data[0].id }));
      }
    } catch (error) {
      toast.error('Failed to fetch available drivers: ' + error.message);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchItems = async () => {
    setLoadingItems(true);
    try {
      const response = await fetch(getApiUrl('/api/item'), {
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
      const response = await fetch(getApiUrl(`/api/restaurant/${params.id}/address/${addressId}/commission`), {
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
      
      // Get the first available zone for each commission type
      const firstFullZone = Object.keys(data.full_commission)[0];
      const firstPartialZone = Object.keys(data.partial_commission)[0];
      const firstFeesZone = Object.keys(data.user_fees)[0];
      
      // Set initial values in formData and selectedZones
      setFormData(prev => ({
        ...prev,
        full_commission: data.full_commission[firstFullZone] || 0,
        partial_commission: data.partial_commission[firstPartialZone] || 0,
        fees: data.user_fees[firstFeesZone] || 0
      }));

      // Set selected zones to first available
      setSelectedZones({
        full_commission: firstFullZone,
        partial_commission: firstPartialZone,
        user_fees: firstFeesZone
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
      const response = await fetch(`http://127.0.0.1:8000/api/delivery`, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create delivery');
      }

      const data = await response.json();
      toast.success('Delivery created successfully!');
    //   router.push(`/restaurants-owner/restaurants/${params.id}`);
    } catch (err) {
      setError(err.message || "Failed to create delivery");
      toast.error(err.message || "Failed to create delivery");
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

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAvailability = 
      availabilityFilter === 'all' ? true :
      availabilityFilter === 'available' ? item.status === 'available' :
      item.status === 'unavailable';
    return matchesSearch && matchesAvailability;
  });

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Clients Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Select Client</Label>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search clients..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="border rounded-lg divide-y max-h-[500px] overflow-y-auto">
                  {loadingClients ? (
                    // Skeleton loader for clients
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="p-3 animate-pulse">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-200 rounded-full p-2 h-10 w-10" />
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                            <div className="h-3 bg-gray-200 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    filteredClients.map(client => (
                      <div
                        key={client.id}
                        className={`p-3 cursor-pointer transition-all duration-200 ${
                          formData.client_id === client.id
                            ? 'bg-primary/5'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleClientSelect(client.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-primary/10 p-2 rounded-full">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium truncate">{client.user.name}</h3>
                              <span className="text-xs text-gray-500">ID: {client.id}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                              <Phone className="h-3 w-3" />
                              <span className="truncate">{client.user.phone}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Addresses Section */}
              <div className="space-y-2">
                <Label>Client&apos;s Address</Label>
                <div className="border rounded-lg divide-y max-h-[500px] overflow-y-auto">
                  {formData.client_id ? (
                    loadingAddresses ? (
                      // Skeleton loader for addresses
                      Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className="p-3 animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="bg-gray-200 rounded-full p-2 h-10 w-10" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-1/3" />
                              <div className="h-3 bg-gray-200 rounded w-2/3" />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : clientAddresses.length > 0 ? (
                      clientAddresses.map(address => (
                        <div
                          key={address.address_id}
                          className={`p-3 cursor-pointer transition-all duration-200 ${
                            formData.address_id === address.address_id
                              ? 'bg-primary/5'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleAddressSelect(address.address_id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              {address.name?.toLowerCase().includes('work') ? (
                                <Building2 className="h-5 w-5 text-primary" />
                              ) : (
                                <Home className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium truncate">{address.name || 'Home'}</h3>
                                {address.postal_code && (
                                  <span className="text-xs text-gray-500">{address.postal_code}</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 truncate mt-0.5">
                                {address.street && `${address.street}, `}
                                {address.neighberhood && `${address.neighberhood}, `}
                                {address.city}, {address.province}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No addresses found for this client
                      </div>
                    )
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      Select a client to view their addresses
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Items Grid - Takes 2/3 of the space */}
              <div className="lg:col-span-2">
                <div className="sticky top-4 z-10 bg-white pb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search items..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button
                      type="button"
                      variant={availabilityFilter === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAvailabilityFilter('all')}
                    >
                      All Items
                    </Button>
                    <Button
                      type="button"
                      variant={availabilityFilter === 'available' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAvailabilityFilter('available')}
                    >
                      Available
                    </Button>
                    <Button
                      type="button"
                      variant={availabilityFilter === 'unavailable' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setAvailabilityFilter('unavailable')}
                    >
                      Unavailable
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {filteredItems.map(item => (
                    <div 
                      key={item.id} 
                      className={`group relative border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 ${
                        item.status === 'unavailable' ? 'opacity-60' : ''
                      }`}
                    >
                      <div className="aspect-square relative bg-gray-100">
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
                        {item.status === 'unavailable' && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="bg-white/90 text-xs font-medium px-2 py-1 rounded-full">
                              Unavailable
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="flex items-center gap-2 bg-white/90 rounded-full px-3 py-1.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleItemQuantityChange(item.id, -1)}
                              disabled={getItemQuantity(item.id) === 0 || item.status === 'unavailable'}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center font-medium">{getItemQuantity(item.id)}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleItemQuantityChange(item.id, 1)}
                              disabled={item.status === 'unavailable'}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-sm truncate">{item.name}</h3>
                          {item.status === 'available' && (
                            <span className="text-xs text-green-600 font-medium">Available</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-500">${item.price.toFixed(2)}</p>
                          {item.prep_time && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              <span>{item.prep_time}m</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {getItemQuantity(item.id) > 0 && (
                        <div className="absolute top-1 right-1 bg-primary text-white text-xs font-medium px-1.5 py-0.5 rounded-full">
                          {getItemQuantity(item.id)}
                        </div>
                      )}
                    </div>
                  ))}
                  {filteredItems.length === 0 && !loadingItems && (
                    <div className="col-span-full p-4 border rounded-lg text-center text-gray-500">
                      No items found
                    </div>
                  )}
                  {loadingItems && (
                    <div className="col-span-full p-4 border rounded-lg text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Billing Details - Takes 1/3 of the space */}
              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <div className="border rounded-lg bg-white shadow-sm">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold">Order Summary</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      {formData.items.length > 0 ? (
                        <>
                          <div className="space-y-3">
                            {formData.items.map(item => {
                              const itemDetails = items.find(i => i.id === item.id);
                              return (
                                <div key={item.id} className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{itemDetails?.name}</span>
                                    <span className="text-gray-500">x{item.quantity}</span>
                                  </div>
                                  <span className="font-medium">${(itemDetails?.price * item.quantity).toFixed(2)}</span>
                                </div>
                              );
                            })}
                          </div>
                          <Separator />
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Subtotal</span>
                              <span className="font-medium">
                                ${formData.items.reduce((total, item) => {
                                  const itemDetails = items.find(i => i.id === item.id);
                                  return total + (itemDetails?.price * item.quantity);
                                }, 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Delivery Fee</span>
                              <span className="font-medium">${formData.fees.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between font-semibold">
                              <span>Total</span>
                              <span>
                                ${(formData.items.reduce((total, item) => {
                                  const itemDetails = items.find(i => i.id === item.id);
                                  return total + (itemDetails?.price * item.quantity);
                                }, 0) + formData.fees).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-gray-500 py-4">
                          No items selected
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Driver Selection */}
              <div className="space-y-4">
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
                <div className="border rounded-lg divide-y max-h-[500px] overflow-y-auto">
                  {loadingDrivers ? (
                    <div className="p-4 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading drivers...</p>
                    </div>
                  ) : drivers.length > 0 ? (
                    drivers.map(driver => (
                      <div
                        key={driver.id}
                        className={`p-3 cursor-pointer transition-all duration-200 ${
                          formData.driver_id === driver.id
                            ? 'bg-primary/5'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, driver_id: driver.id }))}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                              {driver.user.image ? (
                                <img
                                  src={driver.user.image}
                                  alt={driver.user.name}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                              )}
                            </div>
                            <div className="absolute -bottom-1 -right-1">
                              <div className={`w-2.5 h-2.5 rounded-full border-2 border-white ${
                                driver.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                              }`} />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium truncate">{driver.user.name}</h3>
                              <span className="text-xs text-gray-500 capitalize">{driver.type.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
                              <Phone className="h-3 w-3" />
                              <span className="truncate">{driver.user.phone}</span>
                            </div>
                            {driver.distance_to_restaurant && (
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                <Navigation className="h-3 w-3" />
                                <span>{driver.distance_to_restaurant.toFixed(1)} km</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4">
                      <Alert>
                        <AlertCircleIcon className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          No drivers are currently available. The delivery will be created but will remain in a pending state until a driver becomes available.
                        </AlertDescription>
                      </Alert>
                      <div className="mt-4 text-sm text-gray-500">
                        <p>You can still proceed with creating the delivery. The system will automatically assign a driver when one becomes available.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Settings */}
              <div className="space-y-4">
                {/* Payment & Delivery Type */}
                <div className="grid grid-cols-2 gap-4">
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

                {/* Commissions & Fees */}
                <div className="border rounded-lg p-4 space-y-4">
                  <h3 className="font-medium">Commissions & Fees</h3>
                  {Object.keys(commissions.full_commission).length === 1 && 
                   Object.keys(commissions.full_commission)[0] === 'default' && (
                    <Alert className="mb-4">
                      <AlertCircleIcon className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        These are the default restaurant settings values. You can modify them in the restaurant settings.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="full_commission">Full Commission</Label>
                      <div className="flex gap-2">
                        <Select
                          value={selectedZones.full_commission}
                          onValueChange={(value) => handleZoneChange('full_commission', value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select zone" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(commissions.full_commission).map(([zone, value]) => (
                              <SelectItem key={zone} value={zone}>
                                {zone === 'default' ? 'Default' : `Zone ${zone}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="relative flex-1">
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
                      <div className="flex gap-2">
                        <Select
                          value={selectedZones.partial_commission}
                          onValueChange={(value) => handleZoneChange('partial_commission', value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select zone" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(commissions.partial_commission).map(([zone, value]) => (
                              <SelectItem key={zone} value={zone}>
                                {zone === 'default' ? 'Default' : `Zone ${zone}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="relative flex-1">
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
                      <Label htmlFor="fees">Delivery Fee</Label>
                      <div className="flex gap-2">
                        <Select
                          value={selectedZones.user_fees}
                          onValueChange={(value) => handleZoneChange('user_fees', value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Select zone" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(commissions.user_fees).map(([zone, value]) => (
                              <SelectItem key={zone} value={zone}>
                                {zone === 'default' ? 'Default' : `Zone ${zone}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="relative flex-1">
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
                </div>

                {/* Delivery Note */}
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
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Order Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Client & Delivery Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Client Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Name:</span>
                          <span className="text-gray-600">{clients.find(c => c.id === formData.client_id)?.user.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Phone:</span>
                          <span className="text-gray-600">{clients.find(c => c.id === formData.client_id)?.user.phone}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Navigation className="h-4 w-4" />
                        Delivery Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Payment:</span>
                          <span className="text-gray-600 capitalize">{formData.payment_type}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Type:</span>
                          <span className="text-gray-600 capitalize">{formData.type}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Selected Items */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <CircleDot className="h-4 w-4" />
                      Selected Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {formData.items.map(item => {
                        const itemDetails = items.find(i => i.id === item.id);
                        return (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-md bg-gray-100 flex items-center justify-center">
                                {itemDetails?.image ? (
                                  <img
                                    src={itemDetails.image}
                                    alt={itemDetails.name}
                                    className="w-6 h-6 object-cover rounded"
                                  />
                                ) : (
                                  <span className="text-lg">🍽️</span>
                                )}
                              </div>
                              <div>
                                <span className="font-medium">{itemDetails?.name}</span>
                                <span className="text-gray-500 ml-2">x{item.quantity}</span>
                              </div>
                            </div>
                            <span className="font-medium">${(itemDetails?.price * item.quantity).toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Delivery Note */}
                {formData.note && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircleIcon className="h-4 w-4" />
                        Delivery Note
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{formData.note}</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Order Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Subtotal */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Subtotal</span>
                          <span className="font-medium">
                            ${formData.items.reduce((total, item) => {
                              const itemDetails = items.find(i => i.id === item.id);
                              return total + (itemDetails?.price * item.quantity);
                            }, 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Delivery Fee</span>
                          <span className="font-medium">${formData.fees.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Commissions */}
                      <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Full Commission</span>
                          <span className="font-medium">{formData.full_commission}%</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Partial Commission</span>
                          <span className="font-medium">{formData.partial_commission}%</span>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between font-semibold">
                          <span>Total</span>
                          <span>
                            ${(formData.items.reduce((total, item) => {
                              const itemDetails = items.find(i => i.id === item.id);
                              return total + (itemDetails?.price * item.quantity);
                            }, 0) + formData.fees).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Driver Info */}
                      {formData.driver_id && (
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                              {drivers.find(d => d.id === formData.driver_id)?.user.image ? (
                                <img
                                  src={drivers.find(d => d.id === formData.driver_id)?.user.image}
                                  alt={drivers.find(d => d.id === formData.driver_id)?.user.name}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {drivers.find(d => d.id === formData.driver_id)?.user.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {drivers.find(d => d.id === formData.driver_id)?.type.replace('_', ' ')}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6 pb-24">
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

      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-between">
            {steps.map((step) => (
              <div 
                key={step.id} 
                className="flex flex-col items-center"
              >
                <button
                  onClick={() => handleStepClick(step.id)}
                  disabled={!canNavigateToStep(step.id)}
                  className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                    currentStep >= step.id
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 bg-white'
                  } ${
                    canNavigateToStep(step.id)
                      ? 'cursor-pointer hover:scale-110'
                      : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step.id}</span>
                  )}
                </button>
                <div className="mt-2 text-center">
                  <span className={`text-sm font-medium ${
                    canNavigateToStep(step.id) ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  <p className={`text-xs ${
                    canNavigateToStep(step.id) ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {renderStepContent()}
          </CardContent>
        </Card>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
            >
              Previous
            </Button>
            {currentStep === steps.length ? (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Delivery"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleNext}
                disabled={loading || !isStepComplete(currentStep)}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
