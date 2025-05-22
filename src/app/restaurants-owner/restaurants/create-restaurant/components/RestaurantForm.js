'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const RestaurantForm = ({ formData, setFormData, addressDetails, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Restaurant Name</label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="Enter restaurant name"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          placeholder="Enter restaurant description"
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Image URL</label>
        <Input
          type="url"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          required
          placeholder="Enter image URL"
        />
      </div>

      {addressDetails && (
        <div className="border p-4 rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-2">Address Details</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Street:</span> {addressDetails.street}</p>
            <p><span className="font-medium">City:</span> {addressDetails.city}</p>
            <p><span className="font-medium">Province:</span> {addressDetails.province}</p>
            <p><span className="font-medium">Postal Code:</span> {addressDetails.postal_code}</p>
          </div>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        size="lg"
      >
        Create Restaurant
      </Button>
    </form>
  );
};

export default RestaurantForm; 