'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Clock } from 'lucide-react';
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge"

export default function PricingPage() {
    const router = useRouter();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/visitor/plan', {
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

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        router.push(`/restaurants-owner/signup?plan=${plan.id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Perfect Plan
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Select the plan that best fits your restaurant's needs. All plans include a free trial period.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <Card 
                            key={plan.id}
                            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                                selectedPlan?.id === plan.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                        >
                            {plan.name.toLowerCase().includes('premium') && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg text-sm font-medium">
                                    Popular
                                </div>
                            )}
                            
                            <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-bold text-gray-900">${plan.monthly_price}</span>
                                    <span className="text-gray-600">/month</span>
                                </div>

                                <Badge className="absolute top-4 right-4" variant="outline">{plan.trial_duration}-day free trial</Badge>
                                
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center">
                                        <Check className="h-5 w-5 text-green-500 mr-2" />
                                        <span className="text-gray-600">{plan.delivery_limit} deliveries/month</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Check className="h-5 w-5 text-green-500 mr-2" />
                                        <span className="text-gray-600">{plan.drivers_limit} drivers</span>
                                    </div>
                                    <div className="flex items-center">
                                        {plan.ai_suggestions ? (
                                            <Check className="h-5 w-5 text-green-500 mr-2" />
                                        ) : (
                                            <X className="h-5 w-5 text-red-500 mr-2" />
                                        )}
                                        <span className="text-gray-600">AI Suggestions</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <p className="font-medium text-gray-900">Features:</p>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center text-gray-600">
                                                <Check className="h-4 w-4 text-green-500 mr-2" />
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
                                    {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <p className="text-gray-600">
                        Try any plan risk-free with our trial period. Upgrade or cancel anytime.
                    </p>
                </div>
            </div>
        </div>
    );
} 