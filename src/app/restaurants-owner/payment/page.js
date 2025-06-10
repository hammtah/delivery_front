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
      // Confirm the payment
      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required'
    });

      if (paymentError) {
        setError(paymentError.message);
      }
    //   } 
    //   else {
        // Payment successful, confirm with backend
        const response = await fetch(`http://localhost:8000/api/payment/${paymentId}/confirm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || 'Failed to confirm payment');
        }

        // Redirect to success page
        // router.push('/payment/success');
        toast.success('Payment successful! Redirecting to success page...');
        // router.push('/payment/success');
    //   }
    } catch (err) {
      setError('An unexpected error occurred.');
      console.error('Payment error:', err);
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