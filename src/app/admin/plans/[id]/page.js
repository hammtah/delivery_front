'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function PlanPage({ params }) {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlan = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/plan/${params.id}`,
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
    }, [params.id]);

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

    const activeSubscriptions = plan.subscriptions.filter(sub => sub.status === 'active');
    const inactiveSubscriptions = plan.subscriptions.filter(sub => sub.status === 'inactive');

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{plan.name} Plan</h1>
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

                {/* Subscriptions Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Subscriptions</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {activeSubscriptions.map((subscription) => (
                                    <tr key={subscription.sub_id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{subscription.restaurants_admin.user.name}</div>
                                            <div className="text-sm text-gray-500">{subscription.restaurants_admin.user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
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
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {subscription.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
