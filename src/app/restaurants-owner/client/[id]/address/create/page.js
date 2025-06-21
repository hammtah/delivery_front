"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import MapComponent from '@/components/MapComponent';
import { getApiUrl } from '@/utils/api';

export default function CreateAddressPage({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    neighborhood: "",
    street: "",
    postal_code: "",
    province: "",
    position: {
      name: "",
      longitude: 0,
      latitude: 0
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(getApiUrl(`/api/client/${params.id}/add-address`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ address: formData }),
      });

      if (!response.ok) {
        throw new Error("Failed to add address");
      }

      toast.success("Address added successfully");
      router.push(`/restaurants-owner/client/${params.id}`);
    } catch (error) {
      toast.error(error.message || "Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='flex flex-row gap-4 w-[88%] justify-center p-6 ml-auto'>
      <div className="w-[80%]">
        <MapComponent 
          addressForm={formData} 
          setAddressForm={setFormData} 
          controls={{
            polygon: false,
            polyline: false,
            rectangle: false,
            marker: true,
            circle: false,
            circlemarker: false
          }}
        />
      </div>
      <Card className="w-[20%]">
        <CardHeader>
          <CardTitle>Add New Address</CardTitle>
          <CardDescription>Use the map to get the GeoPosition of the address.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Address Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Neighborhood</Label>
              <Input
                id="neighborhood"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="street">Street</Label>
              <Input
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                name="province"
                value={formData.province}
                onChange={handleChange}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adding..." : "Add Address"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
} 