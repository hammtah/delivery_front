'use client'
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Mail, Phone, User, Plus, Eye, Pencil, Trash2, Navigation, Map, PlusCircle, Search } from 'lucide-react'
import Link from 'next/link'
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { getApiUrl } from '@/utils/api';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [addressesDialogOpen, setAddressesDialogOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await fetch(getApiUrl('/api/client'), {
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
            setLoading(false);
        }
    };

    const handleDeleteClick = (client) => {
        setClientToDelete(client);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(getApiUrl(`/api/client/${clientToDelete.id}`), {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete client');
            }

            toast.success('Client deleted successfully');
            fetchClients();
        } catch (error) {
            toast.error('Failed to delete client: ' + error.message);
        } finally {
            setDeleteDialogOpen(false);
            setClientToDelete(null);
        }
    };

    const handleAddressesClick = (client) => {
        setSelectedClient(client);
        setAddressesDialogOpen(true);
    };

    const filteredClients = clients.filter(client => 
        client.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.user.phone.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <main className="flex-1 p-4 sm:p-6 lg:ml-64">
            <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Clients</h1>
                        <p className="text-gray-500 mt-1">Manage your client list and their addresses</p>
                    </div>
                    <Link href="/restaurants-owner/client/create">
                        <Button className="flex items-center gap-2 w-full sm:w-auto">
                            <Plus className="h-4 w-4" />
                            Add New Client
                        </Button>
                    </Link>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search clients by name, email, or phone..."
                        className="pl-10 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {filteredClients.map((client) => (
                        <Card key={client.id} className="group hover:shadow-lg transition-shadow duration-200 relative">
                            <CardContent className="p-6 ">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-2 rounded-full">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{client.user.name}</h3>
                                            <p className="text-sm text-gray-500">{client.user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 absolute right-2 top-2">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8"
                                            onClick={() => handleAddressesClick(client)}
                                        >
                                            <Map className="h-4 w-4" />
                                        </Button>
                                        <Link href={`/restaurants-owner/client/${client.id}`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Link href={`/restaurants-owner/client/${client.id}/edit`}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDeleteClick(client)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone className="h-4 w-4" />
                                        <span>{client.user.phone}</span>
                                    </div>
                                    {client.note && (
                                        <div className="text-sm text-gray-600 line-clamp-2">
                                            <span className="font-medium">Note:</span> {client.note}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {client.addresses?.length || 0} {client.addresses?.length<2 ? 'Address' : 'Addresses'}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs">
                                            {client.addresses?.reduce((acc, addr) => acc + addr.zones.length, 0) || 0} Zones
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Client</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {clientToDelete?.user?.name}? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Addresses Dialog */}
            <Dialog open={addressesDialogOpen} onOpenChange={setAddressesDialogOpen}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Manage Addresses & Zones</DialogTitle>
                        <DialogDescription>
                            Manage addresses and zones for {selectedClient?.user?.name}
                        </DialogDescription>
                        <Link href={`/restaurants-owner/client/${selectedClient?.id}/address/create`} >
                            <Button variant="outline" >
                                    Add Address<Plus className="h-4 w-4 mr-2" />
                            </Button>
                        </Link>
                    </DialogHeader>
                    <div className="mt-4 space-y-4 overflow-y-auto max-h-[500px]">
                        {selectedClient?.addresses.map((address) => (
                            <div key={address.address_id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                <div className="flex items-start gap-4">
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <MapPin className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{address.name}</h3>
                                                <p className="text-sm text-gray-500">{address.city}, {address.province}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-gray-500">
                                                    {address.postal_code}
                                                </Badge>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        
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
                                                                        {zone.radius}km
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
                </DialogContent>
            </Dialog>
        </main>
    );
} 