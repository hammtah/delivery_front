'use client';

import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { getApiUrl } from '@/utils/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  TrendingDown, 
  Store, 
  Package, 
  Users, 
  Truck, 
  DollarSign, 
  Clock,
  MapPin,
  Calendar,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw
} from "lucide-react";
import { format } from 'date-fns';
import Link from 'next/link';
import Loading from '@/components/loading';
import RestaurantStatsCard from '@/components/dashboard/RestaurantStatsCard';
import DeliveryChart from '@/components/dashboard/DeliveryChart';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActions from '@/components/dashboard/QuickActions';

export default function RestaurantOwnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    restaurants: [],
    deliveries: [],
    drivers: [],
    revenue: {
      total: 0,
      thisMonth: 0,
      lastMonth: 0,
      growth: 0
    },
    stats: {
      totalRestaurants: 0,
      activeRestaurants: 0,
      totalDeliveries: 0,
      pendingDeliveries: 0,
      completedDeliveries: 0,
      totalDrivers: 0,
      onlineDrivers: 0,
      totalRevenue: 0,
      monthlyRevenue: 0
    },
    recentDeliveries: [],
    deliveryStats: {
      pending: 0,
    //   inProgress: 0,
      completed: 0,
      cancelled: 0
    },
    recentActivities: []
  });

  // Check authentication
  if (typeof window !== 'undefined' && localStorage.getItem('token') == null) {
    redirect('/restaurants-owner/login');
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch restaurants
      const restaurantsResponse = await fetch(getApiUrl('/api/restaurant'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (restaurantsResponse.ok) {
        const restaurantsData = await restaurantsResponse.json();
        const restaurants = restaurantsData.data;
        
        // Fetch deliveries for all restaurants
        let allDeliveries = [];
        for (const restaurant of restaurants) {
          try {
            const deliveriesResponse = await fetch(getApiUrl(`/api/restaurant/${restaurant.id}/deliveries`), {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            });
            
            if (deliveriesResponse.ok) {
              const deliveriesData = await deliveriesResponse.json();
              allDeliveries = [...allDeliveries, ...deliveriesData.data];
            }
          } catch (error) {
            console.error(`Error fetching deliveries for restaurant ${restaurant.id}:`, error);
          }
        }

        // Fetch drivers
        const driversResponse = await fetch(getApiUrl('/api/driver'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        let drivers = [];
        if (driversResponse.ok) {
          const driversData = await driversResponse.json();
          drivers = driversData.data || [];
        }

        // Calculate statistics
        const stats = calculateStats(restaurants, allDeliveries, drivers);
        const recentDeliveries = allDeliveries
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);
        
        const deliveryStats = calculateDeliveryStats(allDeliveries);
        const revenue = calculateRevenue(allDeliveries);
        const recentActivities = generateRecentActivities(restaurants, allDeliveries, drivers);

        setDashboardData({
          restaurants,
          deliveries: allDeliveries,
          drivers,
          revenue,
          stats,
          recentDeliveries,
          deliveryStats,
          recentActivities
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const calculateStats = (restaurants, deliveries, drivers) => {
    const totalRestaurants = restaurants.length;
    const activeRestaurants = restaurants.filter(r => r.status === 'active').length;
    const totalDeliveries = deliveries.length;
    const pendingDeliveries = deliveries.filter(d => d.status === 'pending').length;
    const completedDeliveries = deliveries.filter(d => d.status === 'completed').length;
    const totalDrivers = drivers.length;
    const onlineDrivers = drivers.filter(d => (d.status === 'busy' || d.status === 'online')).length;
    
    const totalRevenue = deliveries
      .filter(d => d.status === 'completed')
      .reduce((sum, d) => sum + (d.total_amount || 0), 0);
    
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const monthlyRevenue = deliveries
      .filter(d => {
        const deliveryDate = new Date(d.created_at);
        return d.status === 'completed' && 
               deliveryDate.getMonth() === thisMonth && 
               deliveryDate.getFullYear() === thisYear;
      })
      .reduce((sum, d) => sum + (d.total_amount || 0), 0);

    return {
      totalRestaurants,
      activeRestaurants,
      totalDeliveries,
      pendingDeliveries,
      completedDeliveries,
      totalDrivers,
      onlineDrivers,
      totalRevenue,
      monthlyRevenue
    };
  };

  const calculateDeliveryStats = (deliveries) => {
    return {
      pending: deliveries.filter(d => d.status === 'pending').length,
    //   inProgress: deliveries.filter(d => d.status === 'in_progress').length,
      delivered: deliveries.filter(d => d.status === 'delivered').length,
      assigned: deliveries.filter(d => d.status === 'assigned').length,
      cancelled: deliveries.filter(d => d.status === 'cancelled').length,
    };
  };

  const calculateRevenue = (deliveries) => {
    const total = deliveries
      .filter(d => d.status === 'delivered')
      .reduce((sum, d) => sum + (d.total_amount || 0), 0);
    
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthRevenue = deliveries
      .filter(d => {
        const deliveryDate = new Date(d.created_at);
        return d.status === 'delivered' && 
               deliveryDate.getMonth() === thisMonth && 
               deliveryDate.getFullYear() === thisYear;
      })
      .reduce((sum, d) => sum + (d.total_amount || 0), 0);
    
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    const lastMonthRevenue = deliveries
      .filter(d => {
        const deliveryDate = new Date(d.created_at);
        return d.status === 'delivered' && 
               deliveryDate.getMonth() === lastMonth && 
               deliveryDate.getFullYear() === lastMonthYear;
      })
      .reduce((sum, d) => sum + (d.total_amount || 0), 0);
    
    const growth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
    
    return {
      total,
      thisMonth: thisMonthRevenue,
      lastMonth: lastMonthRevenue,
      growth
    };
  };

  const generateRecentActivities = (restaurants, deliveries, drivers) => {
    const activities = [];
    
    // Add recent deliveries as activities
    deliveries.slice(0, 3).forEach(delivery => {
      activities.push({
        type: 'delivery',
        title: `Delivery #${delivery.id} ${delivery.status}`,
        description: `Order for ${delivery.client?.name || 'Unknown Client'} - $${delivery.total_amount || 0}`,
        timestamp: delivery.created_at,
        status: delivery.status
      });
    });

    // Add restaurant activities
    if (restaurants.length > 0) {
      const latestRestaurant = restaurants[restaurants.length - 1];
      activities.push({
        type: 'restaurant',
        title: `Restaurant ${latestRestaurant.status}`,
        description: `${latestRestaurant.name} is now ${latestRestaurant.status}`,
        timestamp: latestRestaurant.updated_at || new Date().toISOString(),
        status: latestRestaurant.status
      });
    }

    // Add driver activities
    if (drivers.length > 0) {
      const latestDriver = drivers[drivers.length - 1];
      activities.push({
        type: 'driver',
        title: `Driver ${latestDriver.status}`,
        description: `${latestDriver.name || 'New driver'} is now ${latestDriver.status}`,
        timestamp: latestDriver.updated_at || new Date().toISOString(),
        status: latestDriver.status
      });
    }

    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
    //   in_progress: { color: 'bg-blue-100 text-blue-300', text: 'In Progress' },
      delivered: { color: 'bg-green-100 text-green-800', text: 'Delivered' },
      assigned: { color: 'bg-red-100 text-blue-800', text: 'Assigned' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', text: status };
    
    return (
      <Badge className={config.color}>
        {config.text}
      </Badge>
    );
  };

  // Prepare chart data
  const deliveryChartData = [
    { name: 'Pending', value: dashboardData.deliveryStats.pending },
    // { name: 'In Progress', value: dashboardData.deliveryStats.inProgress },
    { name: 'Delivered', value: dashboardData.deliveryStats.delivered },
    { name: 'Assigned', value: dashboardData.deliveryStats.assigned },
    { name: 'Cancelled', value: dashboardData.deliveryStats.cancelled }
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 ml-0 md:ml-64 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back! Here's what's happening with your restaurants today.
            </p>
          </div>
          <Button 
            onClick={refreshData} 
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <RestaurantStatsCard
          title="Total Revenue"
          value={`$${dashboardData.revenue.total.toLocaleString()}`}
          icon={DollarSign}
          trend={dashboardData.revenue.growth >= 0 ? 'up' : 'down'}
          trendValue={`${Math.abs(dashboardData.revenue.growth).toFixed(1)}%`}
          trendLabel="from last month"
        />
        
        <RestaurantStatsCard
          title="Active Restaurants"
          value={`${dashboardData.stats.activeRestaurants}/${dashboardData.stats.totalRestaurants}`}
          subtitle={`${dashboardData.stats.totalRestaurants} total restaurants`}
          icon={Store}
        />
        
        <RestaurantStatsCard
          title="Total Deliveries"
          value={dashboardData.stats.totalDeliveries}
          subtitle={`${dashboardData.stats.pendingDeliveries} pending`}
          icon={Package}
        />
        
        <RestaurantStatsCard
          title="Active Drivers"
          value={`${dashboardData.stats.onlineDrivers}/${dashboardData.stats.totalDrivers}`}
          subtitle={`${dashboardData.stats.totalDrivers} total drivers`}
          icon={Truck}
        />
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DeliveryChart data={deliveryChartData} type="pie" />
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              Monthly Revenue
            </CardTitle>
            <CardDescription>
              Revenue performance this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">This Month</span>
                <span className="font-bold text-lg">${dashboardData.revenue.thisMonth.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Month</span>
                <span className="font-medium">${dashboardData.revenue.lastMonth.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Growth</span>
                <div className="flex items-center gap-1">
                  {dashboardData.revenue.growth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`font-medium ${dashboardData.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(dashboardData.revenue.growth).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RecentActivity 
          activities={dashboardData.recentActivities}
          title="Recent Activities"
          viewAllLink="/restaurants-owner/activities"
        />
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Recent Deliveries
                </CardTitle>
                <CardDescription>
                  Latest delivery activities
                </CardDescription>
              </div>
              <Link href="/restaurants-owner/deliveries">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {dashboardData.recentDeliveries.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent deliveries</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData.recentDeliveries.map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="font-medium">Order #{delivery.id}</span>
                        <span className="text-sm text-gray-500">
                          {delivery.client?.user?.name || 'Unknown Client'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-medium">${delivery.total_amount || 0}</span>
                        <div className="text-sm text-gray-500">
                          {format(new Date(delivery.created_at), 'MMM dd, yyyy')}
                        </div>
                      </div>
                      {getStatusBadge(delivery.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
} 