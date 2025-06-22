'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Toaster } from 'sonner';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/utils/api';
import { toast } from 'sonner';
// import { co } from '@fullcalendar/core/internal-common';
// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Payment Form Component
const PaymentForm = ({ clientSecret, subscriptionId, paymentId }) => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);


    try {
        // 1. Confirm the payment on the client-side with Stripe.js
        // This will handle 3D Secure, card details collection, etc.
        const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // This return_url is crucial for handling redirects for 3D Secure or other actions.
                // Stripe will redirect the user to this URL after the payment flow is complete.
                return_url: window !== undefined ? `${window.location.origin}/payment/success?payment_intent_id=${paymentId}`:'', // Pass paymentId for verification
            },
            redirect: 'if_required' // This is the default, but good to be explicit
        });

        if (paymentError) {
            // This means there was an immediate client-side error (e.g., invalid card details).
            setError(paymentError.message);
            toast.error(`Payment failed: ${paymentError.message}`);
            // No need to call your backend if client-side validation failed.
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // Payment was successful on the client-side (no 3D secure needed, or 3D secure completed).
            // Now, inform your backend to update the subscription status.
            console.log('Payment Intent Succeeded (client-side):', paymentIntent);

            const response = await fetch(`http://localhost:8000/api/payment/${paymentId}/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                // Send the payment_intent_id that was just confirmed
                body: JSON.stringify({ payment_intent_id: paymentIntent.id })
            });

            const data = await response.json();
            console.log('Backend confirmation response:', data);

            if (response.ok) {
                toast.success('Payment successful! Your subscription is now active.');
                // Redirect to the success page or subscription management page
                router.push('/restaurants-owner/subscription');
            } else {
                // Backend failed to confirm payment, even if Stripe said it succeeded.
                // This could indicate a data inconsistency or another issue on your server.
                // You should log this error and potentially trigger a manual review process.
                const backendError = data.error || 'Failed to confirm payment with backend.';
                setError(backendError);
                toast.error(`Error activating subscription: ${backendError}`);
                console.error('Backend confirmation failed:', data);
            }
        } else if (paymentIntent && paymentIntent.status === 'requires_action') {
            // Payment requires additional action (like 3D Secure).
            // Stripe.js's `confirmPayment` with `redirect: 'if_required'` will handle the redirect.
            // Your `return_url` will be visited after the action.
            console.log('Payment requires action, redirecting...');
            toast('Please complete the authentication to finalize your payment.');
            // No further action needed here on the frontend, as Stripe handles the redirect.
        } else if (paymentIntent) {
             // Handle other paymentIntent statuses if needed (e.g., 'requires_capture', 'canceled')
            setError(`Payment status: ${paymentIntent.status}. Please check your payment details.`);
            toast.error(`Payment not completed. Status: ${paymentIntent.status}`);
        } else {
            // This case should ideally not be reached if paymentError is null.
            // It means confirmPayment didn't return error or paymentIntent, which is unexpected.
            setError('An unexpected error occurred during payment confirmation.');
            toast.error('An unexpected error occurred during payment confirmation.');
        }
    } catch (err) {
        console.error('Unhandled error during payment process:', err);
        setError('An unexpected error occurred. Please try again.');
        toast.error('An unexpected error occurred. Please try again.');
    } finally {
        setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Payment</h2>
      
      <PaymentElement className="mb-6" />
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        disabled={!stripe || processing}
        className={`w-full py-2 px-4 rounded ${
          processing || !stripe
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        } text-white font-semibold`}
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

// Main Payment Page Component
export default function PaymentPage() {
    const [paymentId, setPaymentId] = useState(null);
    const [clientSecret, setClientSecret] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [subscriptionType, setSubscriptionType] = useState('monthly');
    const [subscriptionDetails, setSubscriptionDetails] = useState(null);

    useEffect(() => {
        const fetchSubscriptionDetails = async () => {
            try {
                const subscriptionId = new URLSearchParams(window.location.search).get('subscription_id');
                if (!subscriptionId) {
                    throw new Error('No subscription ID provided');
                }

                // Fetch subscription details to check if it's a trial
                const response = await fetch(`http://localhost:8000/api/subscription/${subscriptionId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || 'Failed to fetch subscription details');
                }

                setSubscriptionDetails(data.data);
                // If it's not a trial, set the type from the subscription
                if (data.type) {
                    setSubscriptionType(data.type);
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching subscription details:', err);
            }
        };

        fetchSubscriptionDetails();
    }, []);

    const initializePayment = async () => {
        try {
            const subscriptionId = new URLSearchParams(window.location.search).get('subscription_id');
            if (!subscriptionId) {
                throw new Error('No subscription ID provided');
            }

            const response = await fetch(`http://localhost:8000/api/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'accept': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    payment_method: 'stripe',
                    sub_id: subscriptionId,
                    type: subscriptionType,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to initialize payment');
            }

            setClientSecret(data.client_secret);
            setPaymentId(data.payment.id);
        } catch (err) {
            setError(err.message);
            console.error('Payment initialization error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (subscriptionDetails) {
            initializePayment();
        }
    }, [subscriptionDetails, subscriptionType]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-md mx-auto p-6 mt-8 bg-red-100 text-red-700 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!clientSecret) {
        return (
            <div className="max-w-md mx-auto p-6 mt-8 bg-yellow-100 text-yellow-700 rounded-lg">
                <h2 className="text-xl font-bold mb-2">No Payment Information</h2>
                <p>Unable to initialize payment. Please try again.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                {!subscriptionDetails?.type && (
                    <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Choose Your Subscription Type</h2>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setSubscriptionType('monthly')}
                                className={`flex-1 p-4 rounded-lg border ${
                                    subscriptionType === 'monthly'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200'
                                }`}
                            >
                                <h3 className="font-semibold">Monthly</h3>
                                <p className="text-sm text-gray-600">{subscriptionDetails.plan.monthly_price}$</p>
                            </button>
                            <button
                                onClick={() => setSubscriptionType('yearly')}
                                className={`flex-1 p-4 rounded-lg border ${
                                    subscriptionType === 'yearly'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200'
                                }`}
                            >
                                <h3 className="font-semibold">Yearly</h3>
                                <p className="text-sm text-gray-600">{subscriptionDetails.plan.yearly_price}$</p>
                            </button>
                        </div>
                    </div>
                )}
                <Elements
                    stripe={stripePromise}
                    options={{
                        clientSecret,
                        appearance: {
                            theme: 'stripe',
                            variables: {
                                colorPrimary: '#2563eb',
                                colorBackground: '#ffffff',
                                colorText: '#1f2937',
                                colorDanger: '#dc2626',
                                fontFamily: 'system-ui, sans-serif',
                                spacingUnit: '4px',
                                borderRadius: '4px',
                            },
                        },
                    }}
                >
                    <PaymentForm clientSecret={clientSecret} paymentId={paymentId} />
                </Elements>
            </div>
        </div>
    );
} 