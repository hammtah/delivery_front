'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { getApiUrl } from '@/utils/api';

export default function VerifyOTPPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState(null);
    const [otp, setOtp] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        // Get email from localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        // if (!user.email) {
        //     router.push('/restaurants/login');
        //     return;
        // }
        setEmail(user.email);
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
        const value = e.target.value;
        // Only allow numbers and limit to 6 digits
        if (/^\d*$/.test(value) && value.length <= 6) {
            setOtp(value);
            if (error) setError(null);
        }
    };

    const handleResendOTP = async () => {
        setResendLoading(true);
        setError(null);

        try {
            const response = await fetch('http://127.0.0.1:8000/api/resend-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Too many resend attempts. Please try again later');
                } else {
                    throw new Error(data.message || 'Failed to resend OTP');
                }
            }

            toast.success('OTP has been resent to your email');
        } catch (error) {
            setError(error.message);
            toast.error(error.message);
        } finally {
            setResendLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!otp) {
            setError('Please enter the OTP code');
            return;
        }

        if (otp.length !== 6) {
            setError('OTP code must be 6 digits');
            return;
        }

        const otpNumber = parseInt(otp);
        if (otpNumber < 100000 || otpNumber > 999999) {
            setError('Invalid OTP code');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(getApiUrl('/api/verify-otp'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ "otp": otp, "email": email })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid OTP code');
                } else if (response.status === 429) {
                    throw new Error('Too many attempts. Please try again later');
                } else {
                    throw new Error(data.message || 'Verification failed');
                }
            }

            // Store the new token
            localStorage.setItem('token', data.token);
            
            toast.success('OTP verified successfully!');
            
            // Redirect based on user role
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.role === 'restaurants_admin') {
                router.push('/restaurants-owner/restaurants');
            } else {
                router.push('/admin/dashboard');
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
                    <CardTitle className="text-2xl font-bold text-center">Verify Your Email</CardTitle>
                    <CardDescription className="text-center">
                        Enter the 6-digit code sent to {email}
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
                            <Label htmlFor="otp">Verification Code</Label>
                            <Input
                                id="otp"
                                name="otp"
                                type="text"
                                required
                                value={otp}
                                onChange={handleChange}
                                placeholder="Enter 6-digit code"
                                className={error ? 'border-red-500' : ''}
                                maxLength={6}
                                pattern="\d{6}"
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
                                    <span className="ml-2">Verifying...</span>
                                </div>
                            ) : (
                                'Verify Code'
                            )}
                        </Button>

                        <div className="text-center mt-4">
                            <p className="text-sm text-gray-600">
                                Didn&apos;t receive the code?{' '}
                                <button
                                    type="button"
                                    onClick={handleResendOTP}
                                    disabled={resendLoading}
                                    className="text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {resendLoading ? (
                                        <div className="flex items-center">
                                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                            <span>Sending...</span>
                                        </div>
                                    ) : (
                                        'Resend Code'
                                    )}
                                </button>
                            </p>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 