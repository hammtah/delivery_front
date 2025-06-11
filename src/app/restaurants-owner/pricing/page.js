'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from 'lucide-react';
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getApiUrl } from "@/utils/api";

export default function PricingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isFromSubscription = searchParams.get('source') === 'subscription';
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [selectedType, setSelectedType] = useState('monthly'); // 'monthly' or 'yearly'

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await fetch(`${getApiUrl('/api/visitor/plan')}`, {
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setPlans(data.data);
                } else {
                    throw new Error(data.message || 'Failed to fetch plans');
                }
            } catch (error) {
                toast.error('Failed to load plans');
                console.error('Error fetching plans:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPlans();
    }, []);

    const handleSelectPlan = async (plan) => {
        if (isFromSubscription) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${getApiUrl('/api/subscribe')}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({
                        plan_id: plan.id,
                        type: selectedType
                    })
                });

                if (response.ok) {
                    toast.success('Subscription created successfully');
                    router.push('/restaurants-owner/subscription');
                } else {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to create subscription');
                }
            } catch (error) {
                toast.error(error.message || 'Failed to create subscription');
                console.error('Error creating subscription:', error);
            }
        } else {
            setSelectedPlan(plan);
            router.push(`/restaurants-owner/signup?plan=${plan.id}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen ml-0 md:ml-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-16 px-4 sm:px-6 lg:px-8 ml-0 md:ml-64">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8 md:mb-16">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                        {isFromSubscription ? 'Upgrade Your Plan' : 'Choose Your Perfect Plan'}
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
                        {isFromSubscription 
                            ? 'Select a new plan to upgrade your subscription. You can choose between monthly or yearly billing.'
                            : 'Select the plan that best fits your restaurant\'s needs. All plans include a free trial period.'}
                    </p>
                </div>

                {isFromSubscription && (
                    <div className="flex justify-center mb-6 md:mb-8">
                        <div className="inline-flex rounded-lg border p-1 bg-white">
                            <button
                                className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium ${
                                    selectedType === 'monthly'
                                        ? 'bg-blue-500 text-white'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                onClick={() => setSelectedType('monthly')}
                            >
                                Monthly
                            </button>
                            <button
                                className={`px-3 md:px-4 py-2 rounded-md text-sm font-medium ${
                                    selectedType === 'yearly'
                                        ? 'bg-blue-500 text-white'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                onClick={() => setSelectedType('yearly')}
                            >
                                Yearly
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
                    {plans.map((plan) => (
                        <Card 
                            key={plan.id}
                            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                                selectedPlan?.id === plan.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                        >
                            {plan.name.toLowerCase().includes('premium') && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg text-xs md:text-sm font-medium">
                                    Popular
                                </div>
                            )}
                            
                            <div className="p-4 md:p-6 lg:p-8">
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <div className="mb-4 md:mb-6">
                                    <span className="text-3xl md:text-4xl font-bold text-gray-900">
                                        ${selectedType === 'yearly' ? plan.yearly_price : plan.monthly_price}
                                    </span>
                                    <span className="text-gray-600">/{selectedType === 'yearly' ? 'year' : 'month'}</span>
                                </div>

                                {!isFromSubscription && (
                                    <Badge className="absolute top-4 right-4" variant="outline">{plan.trial_duration}-day free trial</Badge>
                                )}
                                
                                <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
                                    <div className="flex items-center">
                                        <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 mr-2" />
                                        <span className="text-sm md:text-base text-gray-600">{plan.delivery_limit} deliveries/month</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 mr-2" />
                                        <span className="text-sm md:text-base text-gray-600">{plan.drivers_limit} drivers</span>
                                    </div>
                                    <div className="flex items-center">
                                        {plan.ai_suggestions ? (
                                            <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 mr-2" />
                                        ) : (
                                            <X className="h-4 w-4 md:h-5 md:w-5 text-red-500 mr-2" />
                                        )}
                                        <span className="text-sm md:text-base text-gray-600">AI Suggestions</span>
                                    </div>
                                </div>

                                <div className="space-y-2 md:space-y-3 mb-6 md:mb-8">
                                    <p className="font-medium text-gray-900">Features:</p>
                                    <ul className="space-y-1 md:space-y-2">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center text-sm md:text-base text-gray-600">
                                                <Check className="h-3 w-3 md:h-4 md:w-4 text-green-500 mr-2" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button
                                    onClick={() => handleSelectPlan(plan)}
                                    className={`w-full ${
                                        selectedPlan?.id === plan.id 
                                            ? 'bg-blue-600 hover:bg-blue-700' 
                                            : 'bg-gray-900 hover:bg-gray-800'
                                    }`}
                                >
                                    {isFromSubscription ? 'Subscribe' : (selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan')}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="mt-8 md:mt-16 text-center">
                    <p className="text-sm md:text-base text-gray-600 px-4">
                        {isFromSubscription 
                            ? 'Your new subscription will start immediately after payment.'
                            : 'Try any plan risk-free with our trial period. Upgrade or cancel anytime.'}
                    </p>
                </div>
            </div>
        </div>
    );
} 