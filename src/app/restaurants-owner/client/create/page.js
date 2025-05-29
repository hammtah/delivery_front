'use client'
import MapComponent from '@/components/MapComponent';
import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

export default function MapPage() {

    const [formAddress, setFormAddress] = useState( {
        street: '',
        city: '',
        neighborhood: '',
        // street_code: '',
        postal_code: '',
        province: '',
        position: {
            name: '',
            longitude: '',
            latitude: ''
        }
    })
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        note: '',
        address: formAddress
    });
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('address.')) {
            // Get the field name after 'address.'
            const field = name.split('.')[1];
            
            // Update formAddress state
            setFormAddress(prev => ({
                ...prev,
                [field]: value
            }));
            
            // Update formData state with the new address
            setFormData(prev => ({
                ...prev,
                address: {
                    ...prev.address,
                    [field]: value
                }
            }));
        } else {
            // Handle non-address fields
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    useEffect(()=>{
        setFormData(prev=>({
            ...prev,
            address: formAddress
        }))
    }, [formAddress])

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:8000/api/client', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData),
            });
            
            if (!response.ok) {
                throw new Error('Failed to create client');
            }
            
            toast.success('Client created successfully!');
        } catch (error) {
            toast.error('Failed to create client: ' + error.message);
        }
    };


    return (
        <main className='flex flex-row gap-4 w-[88%] justify-center p-6 ml-auto'>
            <div className="w-[80%]">
                <MapComponent addressForm={formAddress} setAddressForm={setFormAddress} controls={{
        polygon: false,
        polyline: false,
        rectangle: false,
        marker: true,
        circle: false,
        circlemarker: false
      }}/>
            </div>
            <Card className="w-[20%]">
                <CardHeader>
                    <CardTitle>Create New Client</CardTitle>
                    <CardDescription>Use the map to get the GeoPosition of the client, this is helpful for zone assignement.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        
                        {/* <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div> */}

                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="note">Note</Label>
                            <Textarea
                                id="note"
                                name="note"
                                value={formData.note}
                                onChange={handleInputChange}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Address Details</Label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="street">Street</Label>
                                    <Input
                                        id="street"
                                        name="address.street"
                                        value={formData.address.street}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input
                                        id="city"
                                        name="address.city"
                                        value={formData.address.city}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="neighborhood">Neighborhood</Label>
                                    <Input
                                        id="neighborhood"
                                        name="address.neighborhood"
                                        value={formData.address.neighborhood}
                                        onChange={handleInputChange}
                                        
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="province">Province</Label>
                                    <Input
                                        id="province"
                                        name="address.province"
                                        value={formData.address.province}
                                        onChange={handleInputChange}
                                        
                                    />
                                </div>
                                {/* <div className="space-y-2">
                                    <Label htmlFor="street_code">Street Code</Label>
                                    <Input
                                        id="street_code"
                                        name="address.street_code"
                                        type="number"
                                        value={formData.address.street_code}
                                        onChange={handleInputChange}
                                        
                                    />
                                </div> */}
                                <div className="space-y-2">
                                    <Label htmlFor="postal_code">Postal Code</Label>
                                    <Input
                                        id="postal_code"
                                        name="address.postal_code"
                                        type="number"
                                        value={formData.address.postal_code}
                                        onChange={handleInputChange}
                                        
                                    />
                                </div>
                            </div>
                        </div>

                        <Button type="submit" className="w-full">
                            Create Client
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
} 