'use client';

import { useState, useEffect } from 'react';
import { getApiUrl } from '@/utils/api';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { DollarSign, Package, CreditCard, Clock, User, Calendar, Timer, CheckCircle2, Users } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import DateRangeFilter from './DateRangeFilter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CODList() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeliveries, setSelectedDeliveries] = useState([]);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('all');

  const fetchDrivers = async () => {
    try {
      const response = await fetch(getApiUrl('/api/driver'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setDrivers(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch drivers');
      }
    } catch (error) {
      toast.error('Failed to fetch drivers');
    }
  };

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      let url = getApiUrl('/api/cod-deliveries');
      
      // If a specific driver is selected, fetch their deliveries
      if (selectedDriver !== 'all') {
        url = getApiUrl(`/api/driver/${selectedDriver}/cod-deliveries`);
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setDeliveries(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch COD deliveries');
      }
    } catch (error) {
      toast.error('Failed to fetch COD deliveries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    fetchDeliveries();
  }, [selectedDriver]);

  const handleDriverChange = (driverId) => {
    setSelectedDriver(driverId);
    setSelectedDeliveries([]); // Clear selections when changing driver
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const calculateDelay = (rtime, etime) => {
    if (!rtime || !etime) return null;
    const realTime = new Date(rtime);
    const estimatedTime = new Date(etime);
    const diffMinutes = Math.round((realTime - estimatedTime) / (1000 * 60));
    return diffMinutes;
  };

  const formatDelay = (minutes) => {
    if (minutes === null) return '-';
    const absMinutes = Math.abs(minutes);
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    const sign = minutes < 0 ? '-' : '+';
    
    if (hours > 0) {
      return `${sign}${hours}h ${mins}m`;
    }
    return `${sign}${mins}m`;
  };

  const handleDeliverySelect = (deliveryId) => {
    setSelectedDeliveries(prev => {
      if (prev.includes(deliveryId)) {
        return prev.filter(id => id !== deliveryId);
      } else {
        return [...prev, deliveryId];
      }
    });
  };

  const handlePayDeliveries = async () => {
    try {
      const response = await fetch(getApiUrl('/api/pay-deliveries'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          deliveries: selectedDeliveries
        })
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('COD deliveries paid successfully');
        setSelectedDeliveries([]);
        fetchDeliveries();
      } else {
        toast.error(data.message || 'Failed to pay COD deliveries');
      }
    } catch (error) {
      toast.error('Failed to pay COD deliveries');
    }
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    // Date range filter
    if (dateRange.from) {
      const deliveryDate = new Date(delivery.rtime_arrival);
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      if (!dateRange.to) {
        if (deliveryDate < fromDate) return false;
      } else {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (deliveryDate < fromDate || deliveryDate > toDate) return false;
      }
    }

    // Payment status filter
    if (paymentStatus !== 'all') {
      const isPaid = delivery.delivery_payment_date !== null;
      if (paymentStatus === 'paid' && !isPaid) return false;
      if (paymentStatus === 'unpaid' && isPaid) return false;
    }

    return true;
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      const unpaidFilteredDeliveries = filteredDeliveries
        .filter(delivery => delivery.delivery_payment_date === null)
        .map(delivery => delivery.id);
      setSelectedDeliveries(unpaidFilteredDeliveries);
    } else {
      setSelectedDeliveries([]);
    }
  };

  const isAllSelected = () => {
    const unpaidFilteredDeliveries = filteredDeliveries
      .filter(delivery => delivery.delivery_payment_date === null);
    return unpaidFilteredDeliveries.length > 0 && 
           unpaidFilteredDeliveries.every(delivery => 
             selectedDeliveries.includes(delivery.id)
           );
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading...</div>;
  }

  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      <div className="space-y-6 pb-24">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">COD Deliveries</h2>
          <div className="flex items-center gap-4">
            <Select
              value={selectedDriver}
              onValueChange={(value) => {
                setSelectedDriver(value);
                setSelectedDeliveries([]);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                    <span>All Drivers</span>
                  </div>
                </SelectItem>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    <div className="flex items-center gap-2">
                      <img
                        src={driver.user.image || '/placeholder-avatar.png'}
                        alt={driver.user.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span>{driver.user.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={paymentStatus}
              onValueChange={setPaymentStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Deliveries</SelectItem>
                <SelectItem value="paid">Paid Deliveries</SelectItem>
                <SelectItem value="unpaid">Unpaid Deliveries</SelectItem>
              </SelectContent>
            </Select>
            <DateRangeFilter onDateRangeChange={handleDateRangeChange} />
          </div>
        </div>

        <div className="rounded-md border">
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                    <Checkbox
                      checked={isAllSelected()}
                      onCheckedChange={handleSelectAll}
                      className="mt-1"
                    />
                  </th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Delivery</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Client</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Driver</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Restaurant</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Total Amount</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Delivered At</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Delay</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredDeliveries.map((delivery) => {
                  const isPaid = delivery.delivery_payment_date !== null;
                  const delay = calculateDelay(delivery.rtime_arrival, delivery.etime_arrival);
                  
                  return (
                    <tr 
                      key={delivery.id}
                      className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${
                        selectedDeliveries.includes(delivery.id) ? 'bg-primary/5' : ''
                      } relative`}
                    >
                      {isPaid && delivery.delivery_payment_date && (
                        <div className="absolute top-1 left-1">
                          <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50">
                            <CheckCircle2 className="w-2 h-2 text-green-500" /> {formatDate(delivery.delivery_payment_date)}
                          </Badge>
                        </div>
                      )}
                        {!isPaid ? (
                      <td className="p-4 align-middle ">
                          <Checkbox
                            checked={selectedDeliveries.includes(delivery.id)}
                            onCheckedChange={() => handleDeliverySelect(delivery.id)}
                          />
                        {/* //   <CheckCircle2 className="w-5 h-5 text-green-500" /> */}
                        
                      </td>
                         ) : ''
                    }
                      <td className="p-4 align-middle pt-6">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-primary" />
                          <div>
                            <span className="font-medium">#{delivery.id}</span>
                            {/* <p className="text-xs text-gray-500">Code: {delivery.confirmation_code}</p> */}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {delivery.client && (
                          <div>
                            <p className="font-medium">{delivery.client.user.name}</p>
                            <p className="text-xs text-gray-500">{delivery.client.user.phone}</p>
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        {delivery.driver && (
                          <div className="flex items-center gap-2">
                            <img
                              src={delivery.driver.user.image}
                              alt={delivery.driver.user.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium">{delivery.driver.user.name}</p>
                              <p className="text-xs text-gray-500">{delivery.driver.user.phone}</p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">{delivery.restaurant.name}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          <span className="text-sm text-gray-500">{delivery.type.toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <span className="font-medium text-lg text-primary">${delivery.total_amount.toFixed(2)}</span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        {delivery.rtime_arrival && (
                          <div className="flex items-center gap-1 justify-end">
                            <Calendar className="w-3 h-3" />
                            <span className="text-sm text-gray-500">
                              {formatDate(delivery.rtime_arrival)}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Timer className="w-3 h-3" />
                          <span className={`text-sm ${
                            delay < 0 ? 'text-green-600' : 
                            delay > 0 ? 'text-red-600' : 
                            'text-gray-500'
                          }`}>
                            {formatDelay(delay)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredDeliveries.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            {deliveries.length === 0 
              ? 'No COD deliveries found' 
              : 'No COD deliveries match the selected filters'}
          </div>
        )}
      </div>

      {selectedDeliveries.length > 0 && (
        <div className="fixed bottom-0 left-64 right-0 bg-white border-t p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {selectedDeliveries.length} {selectedDeliveries.length === 1 ? 'delivery' : 'deliveries'} selected
              </span>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="font-medium">
                  Total: ${filteredDeliveries
                    .filter(d => selectedDeliveries.includes(d.id))
                    .reduce((sum, d) => sum + d.total_amount, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
            <Button onClick={handlePayDeliveries}>
              Pay {selectedDeliveries.length} {selectedDeliveries.length === 1 ? 'Delivery' : 'Deliveries'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 