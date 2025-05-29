'use client'
import React from 'react'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { redirect } from 'next/navigation';
import MapComponent from '@/components/MapComponent';
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

if(localStorage.getItem('token')==null){
    redirect('/restaurants/login')
}

export default function CreatePolygonZonePage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        coordinates: [] // Array of {lat, lng} points
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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
                    type: 'polygon' // Specify that this is a polygon zone
                }),
            });
            
            if (!response.ok) {
                throw new Error('Failed to create zone');
            }
            
            toast.success('Polygon zone created successfully!');
            router.push('/restaurants-owner/zones'); // Redirect to zones list
        } catch (error) {
            toast.error('Failed to create zone: ' + error.message);
        }
    };

    return (
        <main className='flex flex-row gap-4 w-[88%] justify-center p-6 ml-auto h-[80vh]'>
            <div className="w-[80%] h-full">
                <MapComponent 
                    controls={{
                        polygon: true,
                        polyline: false,
                        rectangle: false,
                        marker: false,
                        circle: false,
                        circlemarker: false
                    }}
                    onPolygonCreated={(coordinates) => {
                        setFormData(prev => ({
                            ...prev,
                            coordinates: coordinates
                        }));
                    }}
                />
            </div>
            <Card className="w-[20%]">
                <CardHeader>
                    <CardTitle>Create Polygon Zone</CardTitle>
                    <CardDescription>Draw a polygon on the map to define the zone&apos;s coverage area.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        <div className="space-y-2">
                            <Label>Polygon Points</Label>
                            <div className="text-sm text-muted-foreground">
                                {formData.coordinates.length > 0 
                                    ? `${formData.coordinates.length} points defined` 
                                    : 'Draw a polygon on the map'}
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full"
                            disabled={formData.coordinates.length < 3}
                        >
                            Create Zone
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
} 