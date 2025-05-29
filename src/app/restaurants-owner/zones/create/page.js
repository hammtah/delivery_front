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
import { map } from 'leaflet';

if(localStorage.getItem('token')==null){
    redirect('/restaurants/login')
}

export default function CreateZonePage() {
    const router = useRouter();
    const [zoneType, setZoneType] = useState('radius'); // 'radius' or 'polygon'
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        type: 'radius',
        // For radius zone
        center: {
            address: '',
            latitude: '',
            longitude: ''
        },
        radius: '', // in meters
        // For polygon zone
        coordinates: [] // Array of {lat, lng} points
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name.startsWith('center.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                center: {
                    ...prev.center,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleZoneTypeChange = (newType) => {
        setZoneType(newType);
        // Reset zone-specific data while keeping common fields
        setFormData(prev => ({
            name: prev.name,
            description: prev.description,
            type: newType,
            center: {
                address: '',
                latitude: '',
                longitude: ''
            },
            radius: '',
            coordinates: []
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:8000/api/zones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    type: zoneType
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to create zone');
            }
            
            toast.success(`${zoneType === 'radius' ? 'Radius' : 'Polygon'} zone created successfully!`);
            router.push('/restaurants-owner/zones');
        } catch (error) {
            toast.error('Failed to create zone: ' + error.message);
        }
    };

    const isFormValid = () => {
        if (zoneType === 'radius') {
            return formData.name && formData.center.latitude && formData.center.longitude && formData.radius;
        } else {
            return formData.name && formData.coordinates.length >= 3;
        }
    };

    useEffect(()=>{
        console.log('fffffff: ', formData)
    }, [formData])

    return (
        <main className='flex flex-row gap-4 w-[88%] justify-center p-6 ml-auto h-[80vh]'>
            <div className="w-[80%] h-full">
                <MapComponent 
                    controls={{
                        polygon: zoneType === 'polygon',
                        polyline: false,
                        rectangle: false,
                        marker: false,
                        circle: zoneType === 'radius',
                        circlemarker: false
                    }}
                    onCircleCreated={(center, radius) => {
                        // if (zoneType === 'radius') {
                            setFormData(prev => ({
                                ...prev,
                                center: {
                                    ...prev.center,
                                    latitude: center.lat,
                                    longitude: center.lng
                                },
                                radius: radius
                            }));
                        // }
                    }}
                    onPolygonCreated={(coordinates) => {
                        console.log(zoneType, coordinates)
                        console.log(coordinates)
                        // if (zoneType === 'polygon') {
                            setFormData(prev => ({
                                ...prev,
                                coordinates: coordinates
                            }));
                        // }
                    }}
                />
            </div>
            <Card className="w-[20%]">
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
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
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
                                                    name="center.latitude"
                                                    value={formData.center.latitude}
                                                    onChange={handleInputChange}
                                                    readOnly
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="longitude">Longitude</Label>
                                                <Input
                                                    id="longitude"
                                                    name="center.longitude"
                                                    value={formData.center.longitude}
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
                                        {formData.coordinates.length > 0 
                                            ? `${formData.coordinates.length} points defined` 
                                            : 'Draw a polygon on the map'}
                                    </div>
                                </div>
                            )}

                            <Button 
                                type="submit" 
                                className="w-full"
                                disabled={!isFormValid()}
                            >
                                Create Zone
                            </Button>
                        </form>
                    </Tabs>
                </CardContent>
            </Card>
        </main>
    );

    
}
