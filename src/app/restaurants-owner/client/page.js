'use client'
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Mail, Phone, User, Plus, Eye, Pencil, Trash2, Navigation, Map, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { toast } from "sonner"
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

    useEffect(() => {
        fetchClients();
    }, []);

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
            const response = await fetch(`http://127.0.0.1:8000/api/client/${clientToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete client');
            }

            toast.success('Client deleted successfully');
            fetchClients(); // Refresh the list
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen ml-[12%]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <main className="p-6 ml-[12%] w-[88%]">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Clients</h1>
                <Link href="/restaurants-owner/client/create">
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Client
                    </Button>
                </Link>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Client List</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client Info</TableHead>
                                <TableHead>Note</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-500" />
                                                <span className="font-medium">{client.user.name}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-500">{client.user.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm text-gray-500">{client.user.phone}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm text-gray-500">{client.note || 'No note'}</p>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
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
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

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
                    <DialogFooter className="mt-6">
                        <Button variant="outline" onClick={() => setAddressesDialogOpen(false)}>
                            Close
                        </Button>
                        <Link href={`/restaurants-owner/client/${selectedClient?.id}/address/create`}>
                            <Button className="flex items-center gap-2">
                                <PlusCircle className="h-4 w-4" />
                                Add New Address
                            </Button>
                        </Link>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
} 