'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from "sonner";

export default function RestaurantSignup() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        plan_id: searchParams.get('plan') || ''
    });

    useEffect(() => {
        // Check if user is already authenticated
        const token = localStorage.getItem('token');
        if (token) {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role === 'restaurants_admin') {
                router.push('/restaurants-owner/restaurants');
            } else {
                router.push('/admin/plans');
            }
        }
    }, [router]);

    useEffect(() => {
        const fetchPlanDetails = async () => {
            if (!formData.plan_id) {
                toast.error('No plan selected');
                router.push('/restaurants-owner/pricing');
                return;
            }

            try {
                const response = await fetch(`http://127.0.0.1:8000/api/visitor/plan/${formData.plan_id}`, {
                    headers: {
                        'Accept': 'application/json',
                    }
                });
                const data = await response.json();
                if (response.ok) {
                    setSelectedPlan(data.data);
                } else {
                    throw new Error(data.message || 'Failed to fetch plan details');
                }
            } catch (error) {
                toast.error('Failed to load plan details');
                router.push('/restaurants-owner/pricing');
            }
        };

        fetchPlanDetails();
    }, [formData.plan_id, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError(null);
    };

    const validateForm = () => {
        if (!formData.name) {
            setError('Name is required');
            return false;
        }
        if (!formData.email) {
            setError('Email is required');
            return false;
        }
        if (!formData.password) {
            setError('Password is required');
            return false;
        }
        if(!formData.password_confirmation || formData.password_confirmation !== formData.password){
            setError('Password confirmation does not match');
            return false;
        }
        if (!formData.phone) {
            setError('Phone number is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            setError('Please enter a valid email address');
            return false;
        }
        return true;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!validateForm()) {
            toast.error(error);
            return ;
        }
        setLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/restaurants-admin/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    role: 'restaurants_admin'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Signup failed');
            }

            localStorage.setItem('user', JSON.stringify(data.data.user));
            toast.success('Account created successfully!, Please verify your email');

            // Redirect to OTP verification page
            router.push('/restaurants-owner/verify-otp');        
        } catch (error) {
            toast.error(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!selectedPlan) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Restaurant Owner Signup</CardTitle>
                    <CardDescription className="text-center">
                        Create your account to manage your restaurants
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-2">Selected Plan: {selectedPlan.name}</h3>
                        <p className="text-sm text-blue-700">
                            {selectedPlan.trial_duration}-day free trial included
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                            <Input
                                id="password_confirmation"
                                name="password_confirmation"
                                type="password"
                                required
                                value={formData.password_confirmation}
                                onChange={handleChange}
                                placeholder="••••••••"
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 