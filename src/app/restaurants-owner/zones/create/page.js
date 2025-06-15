'use client'
import React, { useEffect } from 'react'
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { redirect } from 'next/navigation';
import MapComponent from '@/components/MapComponent';
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

if(localStorage.getItem('token')==null){
    redirect('/restaurants/login')
}

export default function CreateZonePage() {
    const router = useRouter();
    const [zoneType, setZoneType] = useState('radius'); // 'radius' or 'polygon'
    const [mapKey, setMapKey] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        status: 'active',
        type: 'circle',
        user_fees: '',
        partial_commission_per_km: '',
        full_commission_per_km: '',
        radius: '',
        points: [],
        center_address: {
            position: {
                name: '',
                longitude: '',
                latitude: ''
            }
        }
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleZoneTypeChange = (newType) => {
        setZoneType(newType);
        // Reset zone-specific data while keeping common fields
        setFormData(prev => ({
            name: prev.name,
            status: prev.status,
            type: newType === 'radius' ? 'circle' : 'polygon',
            user_fees: prev.user_fees,
            partial_commission_per_km: prev.partial_commission_per_km,
            full_commission_per_km: prev.full_commission_per_km,
            radius: '',
            points: [],
            center_address: {
                position: {
                    name: '',
                    longitude: '',
                    latitude: ''
                }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:8000/api/zone', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData),
            });
            
            if (!response.ok) {
                throw new Error('Failed to create zone');
            }
            
            toast.success(`${zoneType === 'radius' ? 'Radius' : 'Polygon'} zone created successfully!`);
            setFormData({
                name: '',
                status: 'active',
                type: 'circle',
                user_fees: '',
                partial_commission_per_km: '',
                full_commission_per_km: '',
                radius: '',
                points: [],
                center_address: {
                    position: {
                        name: '',
                        longitude: '',
                        latitude: ''
                    }
                }
            });
            setMapKey(prev => prev + 1);
        } catch (error) {
            toast.error('Failed to create zone: ' + error.message);
        }
    };

    const isFormValid = () => {
        const commonFieldsValid = formData.name && 
            formData.user_fees && 
            formData.partial_commission_per_km && 
            formData.full_commission_per_km;

        if (zoneType === 'radius') {
            return commonFieldsValid && formData.center_address.position.latitude && formData.center_address.position.longitude && formData.radius;
        } else {
            return commonFieldsValid && formData.points.length >= 3;
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 ml-0 md:ml-20 lg:ml-64 transition-all duration-300 max-w-[1200px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
                <div className="w-full lg:w-3/4 h-full">
                    <MapComponent 
                        key={mapKey}
                        controls={{
                            polygon: zoneType === 'polygon',
                            polyline: false,
                            rectangle: false,
                            marker: false,
                            circle: zoneType === 'radius',
                            circlemarker: false,
                            userPosition: true
                        }}
                        onCircleCreated={(center, radius) => {
                            setFormData(prev => ({
                                ...prev,
                                center_address: {
                                    position: {
                                        name: 'Center Point' + new Date().toISOString(),
                                        longitude: center.lng,
                                        latitude: center.lat
                                    }
                                },
                                radius: radius
                            }));
                        }}
                        onPolygonCreated={(coordinates) => {
                            const points = coordinates.map(coord => ({
                                position: {
                                    name: 'Point',
                                    longitude: coord.lng,
                                    latitude: coord.lat
                                }
                            }));
                            setFormData(prev => ({
                                ...prev,
                                points: points
                            }));
                        }}
                    />
                </div>
                <Card className="w-full lg:w-1/4 h-full h-fit mb-2">
                    <CardHeader>
                        <CardTitle>Create New Zone</CardTitle>
                        <CardDescription>Choose the type of zone and draw it on the map.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="radius" className="w-full" onValueChange={handleZoneTypeChange}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="radius">Radius Zone</TabsTrigger>
                                <TabsTrigger value="polygon">Polygon Zone</TabsTrigger>
                            </TabsList>
                            
                            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Zone Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => handleSelectChange('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="user_fees">User Fees</Label>
                                    <Input
                                        id="user_fees"
                                        name="user_fees"
                                        type="number"
                                        step="0.01"
                                        value={formData.user_fees}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="partial_commission_per_km">Partial Commission </Label>
                                    <Input
                                        id="partial_commission_per_km"
                                        name="partial_commission_per_km"
                                        type="number"
                                        step="0.01"
                                        value={formData.partial_commission_per_km}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="full_commission_per_km">Full Commission</Label>
                                    <Input
                                        id="full_commission_per_km"
                                        name="full_commission_per_km"
                                        type="number"
                                        step="0.01"
                                        value={formData.full_commission_per_km}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                {zoneType === 'radius' ? (
                                    <>
                                        <div className="space-y-2">
                                            <Label>Center Point</Label>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="latitude">Latitude</Label>
                                                    <Input
                                                        id="latitude"
                                                        name="center_address.position.latitude"
                                                        value={formData.center_address.position.latitude}
                                                        onChange={handleInputChange}
                                                        readOnly
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="longitude">Longitude</Label>
                                                    <Input
                                                        id="longitude"
                                                        name="center_address.position.longitude"
                                                        value={formData.center_address.position.longitude}
                                                        onChange={handleInputChange}
                                                        readOnly
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="radius">Radius (meters)</Label>
                                            <Input
                                                id="radius"
                                                name="radius"
                                                type="number"
                                                value={formData.radius}
                                                onChange={handleInputChange}
                                                readOnly
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-2">
                                        <Label>Polygon Points</Label>
                                        <div className="text-sm text-muted-foreground">
                                            {formData.points.length > 0 
                                                ? `${formData.points.length} points defined` 
                                                : 'Draw a polygon on the map'}
                                        </div>
                                    </div>
                                )}

                                <Button  
                                    type="submit" 
                                    className="w-full mb-2"
                                    disabled={!isFormValid()}
                                >
                                    Create Zone
                                </Button>
                            </form>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
