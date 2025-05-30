'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, List, Map, MoreVertical, Edit, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dynamic from 'next/dynamic';
// import { headers } from 'next/headers';

// Dynamically import the map component to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => <div className="h-[200px] w-full bg-gray-100 animate-pulse rounded-t-lg" />
});

// Map Preview Component
const ZoneMapPreview = ({ zone }) => {
  return (
    <div className="h-[300px] w-full relative rounded-t-lg overflow-hidden">
      <MapComponent 
        key={zone.id}
        initialZoneData={zone}
        controls={{
          polygon: false,
          polyline: false,
          rectangle: false,
          marker: false,
          circle: false,
          circlemarker: false,
          userPosition: false
        }}
        editing={false}
      />
    </div>
  );
};

export default function ZonesDashboard() {
  const [zones, setZones] = useState([]);
  const [filteredZones, setFilteredZones] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list'); // Default to list view
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchZones();
  }, []);

  useEffect(() => {
    console.log("filtered: ", filteredZones);
  }, [filteredZones]);

  const fetchZones = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://127.0.0.1:8000/api/zone', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Fetched zones:', data);
      setZones(data.data);
      setFilteredZones(data.data);
    } catch (error) {
      console.error('Error fetching zones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    const filtered = zones.filter(zone => 
      zone.name.toLowerCase().includes(query.toLowerCase()) ||
      zone.city.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredZones(filtered);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    if (status === 'all') {
      setFilteredZones(zones);
    } else {
      const filtered = zones.filter(zone => zone.status === status);
      setFilteredZones(filtered);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Zones</h3>
          <p className="text-2xl font-bold">{zones.length}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Active Zones</h3>
          <p className="text-2xl font-bold">
            {zones.filter(zone => zone.status === 'active').length}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-gray-500">Restaurants</h3>
          <p className="text-2xl font-bold">
            {zones.reduce((acc, zone) => acc + (zone.restaurants?.length || 0), 0)}
          </p>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto">
          <Input
            placeholder="Search zones..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full md:w-[300px]"
          />
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            onClick={() => setViewMode('map')}
            disabled
          >
            <Map className="w-4 h-4 mr-2" />
            Map View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4 mr-2" />
            List View
          </Button>
        </div>
      </div>

      {/* Main Content - List View */}
      <div className="h-[600px] relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  h-full">
          {filteredZones.map((zone) => (
            <Card key={zone.id} className=" hover:shadow-lg transition-all duration-300 py-0">
              <ZoneMapPreview zone={zone} />
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{zone.name}</h3>
                    <p className="text-sm text-gray-500">{zone.city}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Zone
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Zone
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(zone.status)}`}>
                      {zone.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Restaurants</span>
                    <span className="font-medium">{zone.restaurants?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Type</span>
                    <span className="font-medium capitalize">{zone.type}</span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-4"
                  onClick={() => window.location.href = `/restaurants-owner/zones/${zone.zone_id}`}
                >
                  View Details
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 