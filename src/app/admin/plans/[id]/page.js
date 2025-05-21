'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
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
import { MoreVertical, User, CreditCard, PauseCircle, TrendingUp, Users, DollarSign, Activity, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export default function PlanPage({ params }) {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [suspend, setSuspend] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        type: 'all'
    });

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/admin/plan/${params.id}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        }
                    }
                );
                const data = await response.json();
                console.log(data);
                setPlan(data.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch plan details');
                setLoading(false);
            }
        };

        fetchPlan();
    }, [params.id, suspend]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    if (!plan) return null;

    const filteredSubscriptions = plan.subscriptions.filter(subscription => {
        const statusMatch = filters.status === 'all' || subscription.status === filters.status;
        const typeMatch = filters.type === 'all' || subscription.type === filters.type;
        return statusMatch && typeMatch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'trial':
                return 'bg-blue-100 text-blue-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            case 'canceled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'yearly':
                return 'bg-blue-100 text-blue-800';
            case 'monthly':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleViewOwner = (owner) => {
        // TODO: Implement view owner action
        console.log('View owner:', owner);
    };

    const handleSuspendSubscription = (subscription) => {
        // TODO: Implement suspend subscription action
        setSuspend(true);
        console.log('Suspend subscription:', subscription);
    };

    const handleViewPayments = (payments) => {
        // TODO: Implement view payments action
        console.log('View payments:', payments);
    };

    const calculateStatistics = () => {
        if (!plan) return null;

        const stats = {
            totalRevenue: 0,
            totalSubscriptions: plan.subscriptions.length,
            activeSubscriptions: plan.subscriptions.filter(sub => sub.status === 'active').length,
            totalPayments: plan.subscriptions.reduce((acc, sub) => acc + sub.payments.length, 0),
            monthlyRevenue: 0,
            yearlyRevenue: 0,
            statusDistribution: {
                active: 0,
                pending: 0,
                trial: 0,
                expired: 0,
                canceled: 0
            },
            typeDistribution: {
                monthly: 0,
                yearly: 0
            }
        };

        plan.subscriptions.forEach(subscription => {
            // Calculate revenue
            subscription.payments.forEach(payment => {
                stats.totalRevenue += payment.amount;
                if (subscription.type === 'monthly') {
                    stats.monthlyRevenue += payment.amount;
                } else {
                    stats.yearlyRevenue += payment.amount;
                }
            });

            // Count status distribution
            stats.statusDistribution[subscription.status] = (stats.statusDistribution[subscription.status] || 0) + 1;
            
            // Count type distribution
            stats.typeDistribution[subscription.type] = (stats.typeDistribution[subscription.type] || 0) + 1;
        });

        return stats;
    };

    const stats = calculateStatistics();

    const getChartData = () => {
        if (!stats) return null;

        return {
            revenueData: [
                { name: 'Monthly', value: stats.monthlyRevenue },
                { name: 'Yearly', value: stats.yearlyRevenue }
            ],
            statusData: Object.entries(stats.statusDistribution).map(([status, count]) => ({
                name: status.charAt(0).toUpperCase() + status.slice(1),
                value: count
            })),
            typeData: [
                { name: 'Monthly', value: stats.typeDistribution.monthly },
                { name: 'Yearly', value: stats.typeDistribution.yearly }
            ]
        };
    };

    const chartData = getChartData();

    const COLORS = {
        revenue: ['#3b82f6', '#10b981'],
        status: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#6b7280', '#0ea5e9'],
        type: ['#8b5cf6', '#3b82f6']
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border rounded shadow-lg">
                    <p className="font-medium">{payload[0].name}</p>
                    <p className="text-sm">
                        {payload[0].name === 'Monthly' || payload[0].name === 'Yearly' 
                            ? `$${payload[0].value}`
                            : payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    const handleExportReport = () => {
        if (!plan) return;

        // Prepare CSV data
        const headers = ['User Name', 'Email', 'Phone', 'Subscription Type', 'Start Date', 'End Date', 'Status', 'Total Payments', 'Total Amount'];
        const rows = plan.subscriptions.map(sub => [
            sub.restaurants_admin.user.name,
            sub.restaurants_admin.user.email,
            sub.restaurants_admin.user.phone,
            sub.type,
            format(new Date(sub.sub_start), 'yyyy-MM-dd'),
            format(new Date(sub.sub_end), 'yyyy-MM-dd'),
            sub.status,
            sub.payments.length,
            sub.payments.reduce((sum, p) => sum + p.amount, 0)
        ]);

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${plan.name}_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-3xl font-bold text-gray-900">{plan.name} Plan</h1>
                        <button
                            onClick={handleExportReport}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-blue-700">Monthly Price</h3>
                            <p className="text-2xl font-bold text-blue-900">${plan.monthly_price}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-green-700">Yearly Price</h3>
                            <p className="text-2xl font-bold text-green-900">${plan.yearly_price}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-purple-700">Trial Duration</h3>
                            <p className="text-2xl font-bold text-purple-900">{plan.trial_duration} days</p>
                        </div>
                    </div>
                </div>

                {/* Features and Limits Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Plan Features</h2>
                        <ul className="space-y-2">
                            {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center text-gray-600">
                                    <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Plan Limits</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Delivery Limit</p>
                                <p className="text-2xl font-semibold text-gray-900">{plan.delivery_limit}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Drivers Limit</p>
                                <p className="text-2xl font-semibold text-gray-900">{plan.drivers_limit}</p>
                            </div>
        <div>
                                <p className="text-sm text-gray-500">AI Suggestions</p>
                                <p className="text-2xl font-semibold text-gray-900">{plan.ai_suggestions ? 'Enabled' : 'Disabled'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Statistics Section */}
                {stats && chartData && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-blue-500" />
                                    Revenue Distribution
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={chartData.revenueData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {chartData.revenueData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS.revenue[index % COLORS.revenue.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-2xl font-bold">${stats.totalRevenue}</p>
                                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5 text-purple-500" />
                                    Subscription Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart className='flex gap-8'>
                                            <Pie
                                                data={chartData.statusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {chartData.statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS.status[index % COLORS.status.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-2xl font-bold">{stats.totalSubscriptions}</p>
                                    <p className="text-sm text-muted-foreground">Total Subscriptions</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className='col-span-2'>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-orange-500" />
                                    Key Metrics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-600">Active Subscriptions</p>
                                        <p className="text-2xl font-bold text-blue-900">{stats.activeSubscriptions}</p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <p className="text-sm text-green-600">Monthly Revenue</p>
                                        <p className="text-2xl font-bold text-green-900">${stats.monthlyRevenue}</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-lg">
                                        <p className="text-sm text-purple-600">Yearly Revenue</p>
                                        <p className="text-2xl font-bold text-purple-900">${stats.yearlyRevenue}</p>
                                    </div>
                                    <div className="p-4 bg-orange-50 rounded-lg">
                                        <p className="text-sm text-orange-600">Average Revenue/Sub</p>
                                        <p className="text-2xl font-bold text-orange-900">
                                            ${stats.totalSubscriptions ? Math.round(stats.totalRevenue / stats.totalSubscriptions) : 0}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}


                {/* Subscriptions Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4 sm:mb-0">Subscriptions</h2>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-2">
                                <label htmlFor="status" className="text-sm font-medium text-gray-700">Status:</label>
                                <Select
                                    value={filters.status}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="trial">Trial</SelectItem>
                                        <SelectItem value="expired">Expired</SelectItem>
                                        <SelectItem value="canceled">Canceled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <label htmlFor="type" className="text-sm font-medium text-gray-700">Type:</label>
                                <Select
                                    value={filters.type}
                                    onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="yearly">Yearly</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payments</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredSubscriptions.map((subscription) => (
                                    <tr key={subscription.sub_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{subscription.restaurants_admin.user.name}</div>
                                            <div className="text-sm text-gray-500">{subscription.restaurants_admin.user.email}</div>
                                            <div className="text-sm text-gray-500">{subscription.restaurants_admin.user.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(subscription.type)}`}>
                                                {subscription.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(subscription.sub_start), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(subscription.sub_end), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(subscription.status)}`}>
                                                {subscription.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {subscription.payments.length} payment{subscription.payments.length !== 1 ? 's' : ''}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="p-2 hover:bg-gray-100 rounded-full">
                                                        <MoreVertical className="h-4 w-4 text-gray-500" />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => handleViewOwner(subscription.restaurants_admin)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <User className="h-4 w-4" />
                                                        <span>View Owner</span>
                                                    </DropdownMenuItem>
                                                    {subscription.status!='suspended' && <DropdownMenuItem
                                                        onClick={() => handleSuspendSubscription(subscription)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <PauseCircle className="h-4 w-4" />
                                                        <span>Suspend Subscription</span>
                                                    </DropdownMenuItem>}
                                                    <DropdownMenuItem
                                                        onClick={() => handleViewPayments(subscription.payments)}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <CreditCard className="h-4 w-4" />
                                                        <span>View Payments</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredSubscriptions.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No subscriptions found matching the current filters
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
