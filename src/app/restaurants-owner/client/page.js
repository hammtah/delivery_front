'use client'
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Mail, Phone, User, Plus } from 'lucide-react'
import Link from 'next/link'
import { toast } from "sonner"

export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);

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
                                <TableHead>Address</TableHead>
                                <TableHead>Zones</TableHead>
                                <TableHead>Note</TableHead>
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
                                        {client.addresses.map((address) => (
                                            <div key={address.address_id} className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm">{address.city}</p>
                                                        <p className="text-sm text-gray-500">{address.province}</p>
                                                        <p className="text-sm text-gray-500">Postal: {address.postal_code}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            {client.addresses.map((address) => (
                                                <div key={address.address_id}>
                                                    {address.zones.length > 0 ? (
                                                        address.zones.map((zone) => (
                                                            <Badge 
                                                                key={zone.id}
                                                            variant={zone.status === 'active' ? 'default' : 'secondary'}
                                                            className="mr-2 mb-2"
                                                        >
                                                            {zone.name}
                                                        </Badge>
                                                    ))
                                                    ) : (
                                                        <Badge variant="secondary" className="mr-2 mb-2">
                                                            N/A
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm text-gray-500">{client.note || 'No note'}</p>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
} 