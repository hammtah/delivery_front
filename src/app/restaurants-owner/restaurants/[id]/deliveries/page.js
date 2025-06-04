'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RestaurantDeliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const params = useParams();

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/restaurant/${params.id}/deliveries`,
            {
                headers: {
                    'accept': 'application/json',
                    'authorization': `Bearer ${localStorage.getItem('token')}`,
                    'content-type': 'application/json',
                },
            }
        );
        const data = await response.json();
        setDeliveries(data.data);
      } catch (error) {
        console.error('Error fetching deliveries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveries();
  }, [params.id]);

  const getStatusColor = (status) => {
    const colors = {
      assigned: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
      pending: 'bg-yellow-500',
    };
    return colors[status] || 'bg-gray-500';
  };

  const calculateDelay = (rtime, etime) => {
    if (!rtime || !etime) return null;
    
    const rtimeDate = new Date(rtime);
    const etimeDate = new Date(etime);
    const diffMinutes = Math.round((rtimeDate - etimeDate) / (1000 * 60));
    
    return diffMinutes;
  };

  const formatDelay = (minutes) => {
    if (minutes === null) return 'N/A';
    if (minutes < 0) return `${Math.abs(minutes)}m early`;
    return `${minutes}m late`;
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Delay</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.map((delivery) => {
                const delay = calculateDelay(delivery.rtime_arrival, delivery.etime_arrival);
                
                return (
                  <TableRow key={delivery.id}>
                    <TableCell>{delivery.id}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(delivery.status)}>
                        {delivery.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={delay === null ? 'bg-gray-500' : delay > 0 ? 'bg-red-500' : 'bg-green-500'}>
                        {formatDelay(delay)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{delivery.client?.user.name}</p>
                        <p className="text-sm text-gray-500">{delivery.client?.user.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{delivery.driver?.user.name}</p>
                        <p className="text-sm text-gray-500">{delivery.driver?.user.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{delivery.address.street}</p>
                        <p className="text-sm text-gray-500">
                          {delivery.address.city}, {delivery.address.province}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="uppercase">{delivery.payment_type}</TableCell>
                    <TableCell>
                      <div>
                        <p>Full: ${delivery.full_commission}</p>
                        <p className="text-sm text-gray-500">Partial: ${delivery.partial_commission}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(delivery.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
