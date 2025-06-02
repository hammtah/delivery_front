'use client'

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Mail, Phone, User, Package, Navigation, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from "sonner"
import Link from 'next/link';
import { Button } from "@/components/ui/button"

export default function ClientDetailsPage() {
    const params = useParams();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentAddressIndex, setCurrentAddressIndex] = useState(0);

    useEffect(() => {
        fetchClientDetails();
    }, [params.id]);

    const fetchClientDetails = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/client/${params.id}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch client details');
            }
            
            const data = await response.json();
            setClient(data.data);
        } catch (error) {
            toast.error('Failed to fetch client details: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevAddress = () => {
        setCurrentAddressIndex((prev) => 
            prev === 0 ? (client?.addresses.length - 1) : prev - 1
        );
    };

    const handleNextAddress = () => {
        setCurrentAddressIndex((prev) => 
            prev === (client?.addresses.length - 1) ? 0 : prev + 1
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen ml-[12%]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="flex items-center justify-center min-h-screen ml-[12%]">
                <p className="text-gray-500">Client not found</p>
            </div>
        );
    }

    return (
        <main className="p-6 ml-[12%] w-[88%]">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Client Details</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Client Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <User className="h-5 w-5 text-gray-500" />
                                <div>
                                    <p className="font-medium">{client.user.name}</p>
                                    <p className="text-sm text-gray-500">Client ID: {client.id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-5 w-5 text-gray-500" />
                                <p className="text-gray-600">{client.user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-5 w-5 text-gray-500" />
                                <p className="text-gray-600">{client.user.phone}</p>
                            </div>
                            {client.note && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-500">Note:</p>
                                    <p className="text-gray-600">{client.note}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Addresses & Zones Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Addresses & Zones</CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handlePrevAddress}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleNextAddress}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            {/* Address Slider */}
                            <div className="overflow-hidden">
                                <div 
                                    className="flex transition-transform duration-300 ease-in-out"
                                    style={{ 
                                        width: `${client.addresses.length * 100}%`,
                                        transform: `translateX(-${(currentAddressIndex * 100) / client.addresses.length}%)`
                                    }}
                                >
                                    {client.addresses.map((address, index) => (
                                        <div 
                                            key={address.address_id} 
                                            className="bg-gray-50 rounded-xl p-6 border border-gray-100"
                                            style={{ width: `${100 / client.addresses.length}%` }}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="bg-white p-3 rounded-lg shadow-sm">
                                                    <MapPin className="h-6 w-6 text-blue-500" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="text-lg font-semibold text-gray-900">{address.name}</h3>
                                                        <Badge variant="outline" className="text-gray-500">
                                                            {address.province}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-500 mb-4">
                                                        {address.city}, Postal Code: {address.postal_code}
                                                    </p>
                                                    
                                                    {address.zones.length > 0 && (
                                                        <div className="mt-4">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Navigation className="h-4 w-4 text-gray-400" />
                                                                <p className="text-sm font-medium text-gray-500">Delivery Zones</p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {address.zones.map((zone) => (
                                                                    <Link 
                                                                        key={zone.id}
                                                                        href={`/restaurants-owner/zones/${zone.id}`}
                                                                        className="no-underline"
                                                                    >
                                                                        <Badge 
                                                                            variant={zone.status === 'active' ? 'default' : 'secondary'}
                                                                            className="px-3 py-1 cursor-pointer hover:opacity-80 transition-opacity"
                                                                        >
                                                                            {zone.name}
                                                                            {zone.type === 'circle' && zone.radius && (
                                                                                <span className="ml-2 text-xs opacity-75">
                                                                                    ({zone.radius}m)
                                                                                </span>
                                                                            )}
                                                                        </Badge>
                                                                    </Link>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Dots Navigation */}
                            <div className="flex justify-center gap-2 mt-4">
                                {client.addresses.map((_, index) => (
                                    <button
                                        key={index}
                                        className={`w-2 h-2 rounded-full transition-colors ${
                                            index === currentAddressIndex 
                                                ? 'bg-blue-500' 
                                                : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                        onClick={() => setCurrentAddressIndex(index)}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Deliveries Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Recent Deliveries</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {client.deliveries.length > 0 ? (
                            <div className="space-y-4">
                                {client.deliveries.map((delivery) => (
                                    <div key={delivery.id} className="flex items-center gap-2 p-4 border rounded-lg">
                                        <Package className="h-5 w-5 text-gray-500" />
                                        <div>
                                            <p className="font-medium">Delivery #{delivery.id}</p>
                                            <p className="text-sm text-gray-500">Status: {delivery.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No deliveries found for this client</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
} 