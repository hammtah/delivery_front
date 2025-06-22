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

export default function CommissionsList() {
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeliveries, setSelectedDeliveries] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
  });
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('all');
  const [selectedDriverType, setSelectedDriverType] = useState('all');

  const fetchDrivers = async () => {
    try {
      const response = await fetch(getApiUrl('/api/driver'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
    //   if (data.success) {
        setDrivers(data.data);
    //   } else {
    if(!response.ok) {
        toast.error(data.message || 'Failed to fetch drivers');
      }
    } catch (error) {
      toast.error('Failed to fetch drivers');
    }
  };

  const fetchCommissions = async () => {
    setLoading(true);
    try {
      const endpoint = selectedDriver === 'all' 
        ? '/api/commissions'
        : `/api/driver/${selectedDriver}/commissions`;
        
      const response = await fetch(getApiUrl(endpoint), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
    //   if (data.success) {
        setCommissions(data.data);
    //   } else {
    if(!response.ok) {
        toast.error(data.message || 'Failed to fetch commissions');
      }
    } catch (error) {
      toast.error('Failed to fetch commissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    fetchCommissions();
  }, [selectedDriver]);

  const handleDeliverySelect = (deliveryId) => {
    setSelectedDeliveries(prev => 
      prev.includes(deliveryId)
        ? prev.filter(id => id !== deliveryId)
        : [...prev, deliveryId]
    );
  };

  const calculateTotalAmount = () => {
    return selectedDeliveries.reduce((total, deliveryId) => {
      const delivery = commissions.find(c => c.id === deliveryId);
      if (delivery) {
        return total + (delivery.commission * delivery.fees / 100);
      }
      return total;
    }, 0);
  };

  const handlePayCommissions = async () => {
    if (selectedDeliveries.length === 0) {
      toast.error("Please select at least one delivery to pay");
      return;
    }

    try {
      const response = await fetch(getApiUrl('/api/pay-commissions'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${localStorage.getItem('token')}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify({ deliveries: selectedDeliveries }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error('Payment failed');

      // Show toast with invoice link if invoice is returned
      if (data.invoice && data.invoice.id) {
        toast.success(
          <span>
            Invoice created!{' '}
            <a
              href={`/restaurants-owner/invoice/${data.invoice.id}`}
              onClick={e => {
                e.preventDefault();
                if (typeof window !== 'undefined') 
                    window.location.href = `/restaurants-owner/invoice/${data.invoice.id}`;
              }}
              className="underline text-blue-600 hover:text-blue-800"
            >
              View Invoice
            </a>
          </span>
        );
      } else {
        toast.success("Commissions paid successfully");
      }
      fetchCommissions();
      setSelectedDeliveries([]);
    } catch (error) {
      toast.error("Failed to pay commissions");
    }
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

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  const filteredCommissions = commissions.filter(commission => {
    // Date range filter
    // if (dateRange.startDate && dateRange.endDate) {
    //   const commissionDate = new Date(commission.rtime_arrival);
    //   const fromDate = new Date(dateRange.startDate);
    //   const toDate = new Date(dateRange.endDate);
      
    //   if (commissionDate < fromDate || commissionDate > toDate) return false;
    // }
        // Date range filter
    if (dateRange.from) {
      const deliveryDate = new Date(commission.rtime_arrival);
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
      const isPaid = commission.commission_payment_date !== null;
      if (paymentStatus === 'paid' && !isPaid) return false;
      if (paymentStatus === 'unpaid' && isPaid) return false;
    }

    return true;
  });

  const handleSelectAll = (checked) => {
    if (checked) {
      // Only select unpaid commissions from the filtered list
      const unpaidFilteredCommissions = filteredCommissions
        .filter(commission => commission.commission_payment_date === null)
        .map(commission => commission.id);
      setSelectedDeliveries(unpaidFilteredCommissions);
    } else {
      setSelectedDeliveries([]);
    }
  };

  const isAllSelected = () => {
    const unpaidFilteredCommissions = filteredCommissions
      .filter(commission => commission.commission_payment_date === null);
    return unpaidFilteredCommissions.length > 0 && 
           unpaidFilteredCommissions.every(commission => 
             selectedDeliveries.includes(commission.id)
           );
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  const totalAmount = calculateTotalAmount();

  return (
    <div className="relative min-h-[calc(100vh-200px)]">
      <div className="space-y-6 pb-24">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Commissions</h2>
          <div className="flex items-center gap-4">
            <DateRangeFilter
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
            />
            <Select
              value={selectedDriver}
              onValueChange={(value) => {
                setSelectedDriverType(value === 'all' ? 'all' : drivers.find(d => d.id === value).type);
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
                <SelectItem value="all">All Commissions</SelectItem>
                <SelectItem value="paid">Paid Commissions</SelectItem>
                <SelectItem value="unpaid">Unpaid Commissions</SelectItem>
              </SelectContent>
            </Select>
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
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Driver</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Type</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Commission Rate</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">User Fees</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Amount to Pay</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Delivered At</th>
                  <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Delay</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {filteredCommissions.map((commission) => {
                  const isPaid = commission.commission_payment_date !== null;
                  const amountToPay = (commission.commission * commission.fees / 100).toFixed(2);
                  const delay = calculateDelay(commission.rtime_arrival, commission.etime_arrival);
                  
                  return (

                    <tr 
                      key={commission.id}
                      className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${
                        selectedDeliveries.includes(commission.id) ? 'bg-primary/5' : ''
                      } relative`}
                    >
                      {isPaid && (
                        <div className="absolute top-1 left-1">
                          <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-50">
                          <CheckCircle2 className="w-2 h-2 text-green-500" /> {formatDate(commission.commission_payment_date)}
                          </Badge>
                        </div>
                      )}
                      {!isPaid ? (
                        <td className="p-4 align-middle">
                          <Checkbox className='mr-2'
                            checked={selectedDeliveries.includes(commission.id)}
                            onCheckedChange={() => handleDeliverySelect(commission.id)}
                          />
                        </td>
                      ):''}
                      <td className="p-4 align-middle pt-5">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-primary" />
                          <span className="font-medium">#{commission.id}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        {commission.driver && (
                          <div className="flex items-center gap-2">
                            <img
                              src={commission.driver.user.image}
                              alt={commission.driver.user.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div>
                              <p className="font-medium">{commission.driver.user.name}</p>
                              <p className="text-xs text-gray-500">{commission.driver.user.phone}</p>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-3 h-3" />
                          {/* <span>{commission.payment_type === 'cod' ? 'Cash On Delivery' : commission.payment_type.toUpperCase()}</span> */}
                          <span>{commission.payment_type.toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-sm text-gray-500">{commission.type.toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <span className="font-medium text-primary">{commission.commission}%</span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <span className="font-medium">${commission.fees.toFixed(2)}</span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <span className="font-medium text-lg text-primary">${amountToPay}</span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Calendar className="w-3 h-3" />
                          <span className="text-sm text-gray-500">
                            {formatDate(commission.rtime_arrival)}
                          </span>
                        </div>
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
        {}
        {/* No commissions found message */}
        {filteredCommissions.length === 0 && (
          <div className="text-center py-10 text-gray-500">
            {commissions.length === 0 ? (
              selectedDriverType === 'monthly' ? (
                <div className="text-center py-4 text-sm text-gray-500">
                  Monthly drivers do not have commissions.
                </div>
              ) : 'No commissions found'
            ) : 'No commissions match the selected filters'}
          </div>
        )}
      </div>

      {/* Fixed Footer */}
      {selectedDeliveries.length > 0 && (
        <div className="fixed bottom-0 left-64 right-0 bg-white border-t shadow-lg p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div>
                <p className="text-sm text-gray-500">Selected Commissions</p>
                <p className="text-lg font-medium">{selectedDeliveries.length} Commission{selectedDeliveries.length > 1 ? 's' : ''}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount to Pay</p>
                <p className="text-2xl font-bold text-primary flex items-center gap-1">
                  <DollarSign className="w-5 h-5" />
                  {totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
            <Button 
              onClick={handlePayCommissions}
              className="flex items-center gap-2 px-8"
              size="lg"
            >
              <DollarSign className="w-4 h-4" />
              Pay Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 