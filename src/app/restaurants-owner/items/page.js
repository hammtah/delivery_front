"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loading from "@/components/loading";
import { getApiUrl } from '@/utils/api';

export default function ItemsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    status: "available",
    prep_time: "",
    image: "",
  });
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const router = useRouter();

  useEffect(() => {
    fetchRestaurants();
    fetchItems();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log(getApiUrl("/api/restaurant"));
      const response = await fetch(getApiUrl("/api/restaurant"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setRestaurants(data.data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      toast.error("Failed to fetch restaurants");
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(getApiUrl("/api/item"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setItems(data.data);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRestaurantToggle = (restaurantId) => {
    setSelectedRestaurants((prev) =>
      prev.includes(restaurantId)
        ? prev.filter((id) => id !== restaurantId)
        : [...prev, restaurantId]
    );
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      status: item.status,
      prep_time: item.prep_time?.toString() || "",
      image: item.image || "",
    });
    setSelectedRestaurants(item.restaurants.map(r => r.id));
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(getApiUrl(`/api/item/${itemToDelete.id}`), {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      toast.success("Item deleted successfully");
      fetchItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedRestaurants.length === 0) {
      toast.error("Please select at least one restaurant");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const url = editingItem 
        ? getApiUrl(`/api/item/${editingItem.id}`)
        : getApiUrl("/api/item");
      
      const response = await fetch(url, {
        method: editingItem ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          prep_time: parseInt(formData.prep_time),
          restaurant_ids: selectedRestaurants,
        }),
      });

      if (!response.ok) {
        throw new Error(editingItem ? "Failed to update item" : "Failed to create item");
      }

      const data = await response.json();
      toast.success(editingItem ? "Item updated successfully" : "Item created successfully");
      fetchItems();
      
      // Reset form and close dialog
      setFormData({
        name: "",
        price: "",
        status: "available",
        prep_time: "",
        image: "",
      });
      setSelectedRestaurants([]);
      setEditingItem(null);
      setOpen(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error(editingItem ? "Failed to update item" : "Failed to create item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 ml-0 md:ml-64 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Items Management</h1>
        <Dialog open={open} onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setEditingItem(null);
            setFormData({
              name: "",
              price: "",
              status: "available",
              prep_time: "",
              image: "",
            });
            setSelectedRestaurants([]);
          }
        }}>
          <DialogTrigger asChild>
            <Button>Create Item</Button>
          </DialogTrigger>
          <DialogContent className="max-w-[90vw] sm:max-w-2xl sm:max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Item" : "Create New Item"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prep_time">Preparation Time (minutes)</Label>
                  <Input
                    id="prep_time"
                    name="prep_time"
                    type="number"
                    value={formData.prep_time}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Select Restaurants</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto min-h-[100px]">
                  {restaurants.map((restaurant) => (
                    <div key={restaurant.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`restaurant-${restaurant.id}`}
                        checked={selectedRestaurants.includes(restaurant.id)}
                        onCheckedChange={() => handleRestaurantToggle(restaurant.id)}
                      />
                      <Label htmlFor={`restaurant-${restaurant.id}`}>
                        {restaurant.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingItem ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editingItem ? "Update Item" : "Create Item"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="w-full overflow-x-auto">
        <CardHeader>
          <CardTitle>Items List</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Loading />
          ) : items.length === 0 ? (
            <p className="text-muted-foreground">No items found</p>
          ) : (
            <div className="space-y-4">
              {/* Mobile/Tablet View */}
              <div className="md:hidden space-y-4">
                {items.map((item) => (
                  <Card key={item.id} className="cursor-pointer" onClick={() => handleEdit(item)}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                          <img 
                            src={item.image ? item.image : "/item_placeholder.png"} 
                            alt={item.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
                          <Badge
                            variant={item.status === "available" ? "default" : "secondary"}
                            className="mt-1"
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Name</TableHead>
                      <TableHead className="whitespace-nowrap">Image</TableHead>
                      <TableHead className="whitespace-nowrap">Price</TableHead>
                      <TableHead className="whitespace-nowrap">Status</TableHead>
                      <TableHead className="whitespace-nowrap">Prep Time</TableHead>
                      <TableHead className="whitespace-nowrap">Restaurants</TableHead>
                      <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <img src={item.image ? item.image : "/item_placeholder.png"} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                        </TableCell>
                        <TableCell>${item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={item.status === "available" ? "default" : "secondary"}
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.prep_time ? item.prep_time + " min" : "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {item.restaurants.length > 0 ? (
                              item.restaurants.map((restaurant) => (
                                <Badge key={restaurant.id} variant="outline">
                                  {restaurant.name}
                                </Badge>
                              ))
                            ) : (
                              'N/A'
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setItemToDelete(item);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the item
              {itemToDelete && ` "${itemToDelete.name}"`}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
