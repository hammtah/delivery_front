'use client'
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { MapPin, Clock, Calendar, ChevronRight, Loader2, AlertCircle, Power, CalendarDays, Play, Pause, ChevronDown, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import Loading from '@/components/loading';
import { getApiUrl } from '@/utils/api';

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export default function WorkingHoursPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [workingHoursData, setWorkingHoursData] = useState({});
  const [expandedSchedules, setExpandedSchedules] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  if (localStorage.getItem('token') == null) {
    redirect('/restaurants-owner/login')
  }

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await fetch(getApiUrl('/api/restaurant'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'content-type': 'application/json',
          'accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }
      const data = await response.json();
      setRestaurants(data.data);
      
      // Fetch working hours for each restaurant
      await fetchAllWorkingHours(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWorkingHours = async (restaurantsList) => {
    const workingHoursPromises = restaurantsList.map(async (restaurant) => {
      try {
        const response = await fetch(getApiUrl(`/api/restaurant/${restaurant.id}/working-hours`), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          return { restaurantId: restaurant.id, workingHours: data.data };
        }
        return { restaurantId: restaurant.id, workingHours: [] };
      } catch (error) {
        console.error(`Error fetching working hours for restaurant ${restaurant.id}:`, error);
        return { restaurantId: restaurant.id, workingHours: [] };
      }
    });

    const results = await Promise.all(workingHoursPromises);
    const workingHoursMap = {};
    results.forEach(({ restaurantId, workingHours }) => {
      workingHoursMap[restaurantId] = workingHours;
    });
    setWorkingHoursData(workingHoursMap);
  };

  const toggleScheduleExpansion = (restaurantId) => {
    setExpandedSchedules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(restaurantId)) {
        newSet.delete(restaurantId);
      } else {
        newSet.add(restaurantId);
      }
      return newSet;
    });
  };

  const formatAddress = (address) => {
    if (!address) return 'No address provided';
    const parts = [
      address.street,
      address.street_code,
      address.city,
      address.province,
      address.postal_code
    ].filter(Boolean);
    return parts.join(', ');
  };

  const getActiveWorkingHours = (workingHours) => {
    if (!workingHours || workingHours.length === 0) return null;
    return workingHours.find(wh => wh.is_active) || workingHours[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  const formatWorkingDays = (workingDays) => {
    if (!workingDays || workingDays.length === 0) {
      return 'No working days configured';
    }

    // Group days by time slots
    const timeGroups = {};
    workingDays.forEach(day => {
      if (day.working_times && day.working_times.length > 0) {
        const timeKey = day.working_times.map(t => `${t.time_start}-${t.time_end}`).join(', ');
        if (!timeGroups[timeKey]) {
          timeGroups[timeKey] = [];
        }
        timeGroups[timeKey].push(day.eday);
      }
    });

    if (Object.keys(timeGroups).length === 0) {
      return 'No working times configured';
    }

    const formattedGroups = Object.entries(timeGroups).map(([times, days]) => {
      const sortedDays = days.sort((a, b) => {
        const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        return dayOrder.indexOf(a) - dayOrder.indexOf(b);
      });
      
      const dayNames = sortedDays?.map(day => day ? day.charAt(0).toUpperCase() + day.slice(1) : '');
      return `${dayNames.join(', ')}: ${times}`;
    });

    return formattedGroups.join(' | ');
  };

  const getWorkingHoursStatus = (restaurant, workingHours) => {
    if (!workingHours || workingHours.length === 0) {
      return { status: 'not-configured', label: 'Not Configured', color: 'bg-gray-100 text-gray-600' };
    }

    // const activeHours = getActiveWorkingHours(workingHours);
    // if (!activeHours) {
    //   return { status: 'inactive', label: 'Inactive', color: 'bg-yellow-100 text-yellow-700' };
    // }

    // if (activeHours.is_active) {
    //   return { status: 'active', label: 'Active', color: 'bg-green-100 text-green-700' };
    // }

    // return { status: 'inactive', label: 'Inactive', color: 'bg-yellow-100 text-yellow-700' };
    return { status: restaurant.status, label: `${restaurant.status.charAt(0).toUpperCase()}${restaurant.status.slice(1)}`, color: restaurant.status === 'closed' ? 'bg-yellow-100 text-yellow-700':'bg-green-100 text-green-700' };
  };

  const getProgramStatusBadge = (program) => {
    const badges = [];
    
    if (program.is_active) {
      badges.push(
        <Badge key="active" className="bg-green-100 text-green-700">
          <Play className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    } else {
      badges.push(
        <Badge key="inactive" className="bg-gray-100 text-gray-600">
          <Pause className="w-3 h-3 mr-1" />
          Inactive
        </Badge>
      );
    }

    if (program.is_auto_active) {
      badges.push(
        <Badge key="auto" className="bg-blue-100 text-blue-700">
          <Power className="w-3 h-3 mr-1" />
          Auto
        </Badge>
      );
    }

    return badges;
  };

  // Filter restaurants based on search term and status filter
  const filteredRestaurants = restaurants.filter(restaurant => {
    const workingHours = workingHoursData[restaurant.id] || [];
    const status = getWorkingHoursStatus(restaurant, workingHours);
    
    // Search filter
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         formatAddress(restaurant.address).toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === 'all' || status.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 ml-0 md:ml-64 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Working Hours Management</h1>
          <p className="text-gray-600 text-sm mt-1">Manage working hours for all your restaurants</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search restaurants by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="not-configured">Not Configured</SelectItem>
              </SelectContent>
            </Select>
            {(searchTerm || statusFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        
        {/* Results Summary */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            Showing {filteredRestaurants.length} of {restaurants.length} restaurants
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter !== 'all' && ` with status "${statusFilter}"`}
          </p>
        </div>
      </div>

      {restaurants.length === 0 && (
        <div className='flex flex-col items-center justify-center mt-16 sm:mt-32'>
          <Image src='/no_restaurant.png' alt='empty' width={100} height={100} className='w-48 sm:w-64 h-24 sm:h-32' />
          <h1 className='text-xl sm:text-2xl font-bold text-gray-800 mt-4'>No restaurants found</h1>
          <p className='text-gray-600 text-sm mb-4 text-center max-w-md'>Please create a restaurant to manage working hours</p>
          <Link href="/restaurants-owner/restaurants/create-restaurant">
            <Button>Create Restaurant</Button>
          </Link>
        </div>
      )}

      {restaurants.length > 0 && filteredRestaurants.length === 0 && (
        <div className='flex flex-col items-center justify-center mt-16 sm:mt-32'>
          <Search className="h-16 w-16 text-gray-400 mb-4" />
          <h1 className='text-xl sm:text-2xl font-bold text-gray-800 mt-4'>No restaurants found</h1>
          <p className='text-gray-600 text-sm mb-4 text-center max-w-md'>
            No restaurants match your current filters. Try adjusting your search or filters.
          </p>
          <Button onClick={clearFilters} variant="outline">
            Clear Filters
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {filteredRestaurants.map((restaurant) => {
          const workingHours = workingHoursData[restaurant.id] || [];
          const status = getWorkingHoursStatus(restaurant, workingHours);
          const activeProgram = getActiveWorkingHours(workingHours);
          const isScheduleExpanded = expandedSchedules.has(restaurant.id);
          
          return (
            <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <img
                        src={restaurant.image || '/restaurant_placeholder.png'}
                        alt={restaurant.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Link href={`/restaurants-owner/restaurants/${restaurant.id}/working-hours`}>
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-start text-gray-600">
                  <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-sm">
                    {formatAddress(restaurant.address)}
                  </span>
                </div>

                {/* Working Hours Programs */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Calendar className="h-4 w-4" />
                    Working Hours Programs ({workingHours.length})
                  </div>
                  
                  {workingHours.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed">
                      <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No working hours programs</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {workingHours.map((program, index) => (
                        <div key={program.id} className="bg-gray-50 rounded-lg p-4 border">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-800">{program.name}</h4>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatDate(program.active_from)} - {formatDate(program.active_to)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {getProgramStatusBadge(program)}
                            </div>
                          </div>
                          
                          {/* Show schedule for active program */}
                          {program.is_active && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                                <CalendarDays className="h-4 w-4" />
                                Current Schedule
                              </div>
                              <p className="text-sm text-gray-600">
                                {formatWorkingDays(program.working_days)}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active Program Schedule - Collapsible */}
                {activeProgram && activeProgram.is_active && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                        <Play className="h-4 w-4" />
                        Active Program: {activeProgram.name}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleScheduleExpansion(restaurant.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {isScheduleExpanded ? (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Hide Schedule
                          </>
                        ) : (
                          <>
                            <ChevronRight className="w-4 h-4 mr-1" />
                            Show Schedule
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {isScheduleExpanded && (
                      <div className="animate-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {DAYS_OF_WEEK.map((day) => {
                            const workingDay = activeProgram.working_days.find(d => d.eday === day);
                            return (
                              <div key={day} className="bg-white rounded-lg p-3 border border-blue-100">
                                <p className="text-sm font-medium text-gray-700 mb-2">{day}</p>
                                {workingDay?.working_times && workingDay.working_times.length > 0 ? (
                                  workingDay.working_times.map((time, index) => (
                                    <div
                                      key={index}
                                      className="bg-blue-100 border border-blue-200 rounded px-3 py-2 text-sm text-blue-700 mb-1"
                                    >
                                      {formatTime(time.time_start)} - {formatTime(time.time_end)}
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-gray-400 text-sm">Closed</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <Link href={`/restaurants-owner/restaurants/${restaurant.id}/working-hours`}>
                    <Button className="w-full" variant="outline">
                      <Clock className="w-4 h-4 mr-2" />
                      Manage Working Hours
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
} 