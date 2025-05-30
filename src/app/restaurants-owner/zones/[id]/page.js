'use client'
import React, { use, useEffect, useState } from 'react'
import { useParams } from 'next/navigation';
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

export default function ViewZonePage() {
    const params = useParams();
    const [zoneData, setZoneData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mapKey, setMapKey] = useState(0);

useEffect(() => {
    console.log("zone Data: ",zoneData);
}, [zoneData]);



    useEffect(() => {
        const fetchZoneData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/zone/${params.id}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch zone data');
                }
                
                const data = await response.json();
                console.log("dataaaaa: ", data.data)
                setZoneData(data.data);
                setLoading(false);
            } catch (error) {
                toast.error('Failed to fetch zone data: ' + error.message);
                setLoading(false);
            }
        };

        fetchZoneData();
    }, [params.id]);

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    if (!zoneData) {
        return <div className="flex items-center justify-center h-screen">Zone not found</div>;
    }

    return (
        <main className='flex flex-row gap-4 w-[88%] justify-center p-6 ml-auto h-[80vh]'>
            <div className="w-[80%] h-full">
                <MapComponent 
                    key={mapKey}
                    controls={{
                        polygon: false,
                        polyline: false,
                        rectangle: false,
                        marker: false,
                        circle: false,
                        circlemarker: false,
                        userPosition: false
                    }}
                    initialZoneData={zoneData}
                />
            </div>
            <Card className="w-[20%]">
                <CardHeader>
                    <CardTitle>Zone Details</CardTitle>
                    <CardDescription>View zone information</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Zone Name</Label>
                            <Input
                                id="name"
                                value={zoneData.name}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Input
                                id="status"
                                value={zoneData.status}
                                readOnly
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Type</Label>
                            <Input
                                id="type"
                                value={zoneData.type}
                                readOnly
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="user_fees">User Fees</Label>
                            <Input
                                id="user_fees"
                                value={zoneData.user_fees}
                                readOnly
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="partial_commission">Partial Commission</Label>
                            <Input
                                id="partial_commission"
                                value={zoneData.partial_commission}
                                readOnly
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="full_commission">Full Commission</Label>
                            <Input
                                id="full_commission"
                                value={zoneData.full_commission}
                                readOnly
                            />
                        </div>

                        {zoneData.type === 'circle' && (
                            <div className="space-y-2">
                                <Label htmlFor="radius">Radius (meters)</Label>
                                <Input
                                    id="radius"
                                    value={zoneData.radius}
                                    readOnly
                                />
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </main>
    );
} 