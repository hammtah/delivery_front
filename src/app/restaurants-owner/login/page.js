'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react'
import { getApiUrl } from '@/utils/api';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError(null);
    };

    const validateForm = () => {
        if (!formData.email) {
            setError('Email is required');
            return false;
        }
        if (!formData.password) {
            setError('Password is required');
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
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(getApiUrl('/api/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle specific error cases
                if (response.status === 401) {
                    throw new Error('Invalid email or password');
                } else if (response.status === 422) {
                    throw new Error(data.message || 'Please check your input');
                } else if (response.status === 429) {
                    throw new Error('Too many login attempts. Please try again later');
                } else {
                    // throw new Error(data.message || 'Something went wrong. Please try again');
                    throw new Error(data || 'Something went wrong. Please try again');
                }
            }

            // Store user data (but not token yet, as we need OTP verification)
            localStorage.setItem('user', JSON.stringify(data.user));
            if(response.ok && data.user.email_verified_at !== null){
                toast.success('Login successful!');
            // Store the new token
            localStorage.setItem('token', data.token);
                router.push('/restaurants-owner/restaurants');
            }else{
                toast.success('Login successful! Please verify your email.');
                
                // Redirect to OTP verification page
                router.push('/restaurants-owner/verify-otp');
            }
        } catch (error) {
            setError(error.message);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
                    <CardDescription className="text-center">
                        Sign in to your account to continue
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                className={error && !formData.email ? 'border-red-500' : ''}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <Link 
                                    href="/restaurants-owner/forgot-password"
                                    className="text-sm text-blue-600 hover:text-blue-500"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className={error && !formData.password ? 'border-red-500' : ''}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <Loader2 className="animate-spin" />
                                    <span className="ml-2">Signing In...</span>
                                </div>
                            ) : (
                                'Sign In'
                            )}
                        </Button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">
                                Don&apos;t have an account?{' '}
                                <Link 
                                    href="/restaurants-owner/signup"
                                    className="text-blue-600 hover:text-blue-500 font-medium"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 