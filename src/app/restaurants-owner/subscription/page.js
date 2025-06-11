"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { getApiUrl } from "@/utils/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, Package, Settings, Trash2, MoreVertical, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SelectArrow } from "@radix-ui/react-select";

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [isPlansLoading, setIsPlansLoading] = useState(false);
  const [isSubscriptionDeleted, setIsSubscriptionDeleted] = useState(false);
  const paymentsPerPage = 5;
  const router = useRouter();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${getApiUrl('/api/subscription')}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        let data = await response.json();
        // data.data.push({
        //   ...data.data[0],
        //   plan: {
        //     ...data.data[0].plan,
        //     name: "Free Plan",
        //     delivery_limit: 0,
        //     drivers_limit: 0,
        //     yearly_price: 0,
        //     monthly_price: 0
        //   },
        //   payments: []
        // });
        setSubscriptions(data.data);
        if (data.data.length > 0) {
          setSelectedSubscription(data.data[0]);
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [isSubscriptionDeleted]);


  const fetchAvailablePlans = async () => {
    setIsPlansLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('/api/visitor/plan')}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
      });
      const data = await response.json();
      setAvailablePlans(data.data);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast.error("Failed to fetch available plans");
    } finally {
      setIsPlansLoading(false);
    }
  };

  const handleSubscribeToPlan = (plan) => {
    router.push(`/restaurants-owner/payment?plan_id=${plan.id}`);
  };

  const handleSubscribeToNewPlan = () => {
    router.push('/restaurants-owner/pricing?source=subscription');
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!subscriptions.length) {
    return <div className="flex items-center justify-center min-h-screen">No subscriptions found</div>;
  }

  const formatDate = (dateString) => {
    return format(new Date(dateString), "MMM d, yyyy");
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const handleSubscribe = (subscription) => {
    router.push(`/restaurants-owner/payment?subscription_id=${subscription.sub_id}`);
  };

  const handleDeleteSubscription = async (subscriptionId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this subscription?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${getApiUrl('/api/subscription')}/${subscriptionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // setSubscriptions(subscriptions.filter(sub => sub.sub_id !== subscriptionId));
        // if (selectedSubscription?.sub_id === subscriptionId) {
        //   setSelectedSubscription(null);
        // }
        toast.success('Subscription deleted successfully');
        setIsSubscriptionDeleted(true)
      } else {
        toast.error('Failed to delete subscription');
      }
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast.error('An error occurred while deleting the subscription');
    }
  };

  const SelectArrow = (e) => {
    const target = e.target.closest('.row');
    if (!target) return;
    document.querySelectorAll('.row').forEach(row => {
        row.classList.remove('bg-muted');
    });
    target.classList.add('bg-muted');
  }
  return (
    <div className="p-6 md:p-8 lg:p-10 ml-0 md:ml-64 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={handleSubscribeToNewPlan}>
              <Plus className="h-4 w-4" />
              Subscribe to New Plan
            </Button>
            <Button variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Manage
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content - Subscriptions Table */}
          <div className="lg:col-span-2">
            <Card >
              <CardHeader>
                <CardTitle>Subscriptions</CardTitle>
                <CardDescription>View and manage your subscription plans</CardDescription>
              </CardHeader>
              <CardContent className='px-3'>
                <Table >
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody >
                    {subscriptions.map((subscription) => (
                      <TableRow 
                        key={subscription.sub_id}
                        className={`row cursor-pointer hover:bg-muted/50 px-3 ${selectedSubscription?.sub_id === subscription.sub_id ? 'bg-muted' : ''}`}
                        onClick={(e) => {
                            setSelectedSubscription(subscription)
                            SelectArrow(e);
                        }
                    }
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {subscription.plan.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className='capitalize' variant={subscription.status === "active" ? "default" : (subscription.status=== "deleted" ? "destructive" : "secondary")}>
                            {subscription.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(subscription.sub_start)} - {formatDate(subscription.sub_end)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatCurrency(subscription.type === "yearly" ? subscription.plan.yearly_price : subscription.plan.monthly_price)}
                        </TableCell>
                        <TableCell>
                            <Badge className='capitalize' variant={subscription.type === "yearly" ? "primary" : "secondary"}>
                                {subscription.type.charAt(0).toUpperCase() + subscription.type.slice(1)}
                            </Badge>
                        </TableCell>
                        <TableCell>
                        {subscription.status !== "deleted" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {subscription.status !== "active" && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSubscribe(subscription);
                                  }}
                                >
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Pay
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-500 focus:text-red-500"
                                onClick={(e) => handleDeleteSubscription(subscription.sub_id, e)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Payment History Section */}
            <Card className="mt-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>View all payment transactions for your subscriptions</CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {selectedSubscription?.payments.length || 0} payments
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedSubscription?.payments
                    .slice((currentPage - 1) * paymentsPerPage, currentPage * paymentsPerPage)
                    .map((payment) => (
                      <div 
                        key={payment.id} 
                        className="relative flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg"></div>
                        <CreditCard className="h-4 w-4 text-gray-400" />
                        <div className="flex-1 min-w-0 grid grid-cols-4 gap-4 items-center">
                          <div>
                            <p className="text-sm font-medium">
                              {formatCurrency(payment.amount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {payment.payment_method ? payment.payment_method.charAt(0).toUpperCase() + payment.payment_method.slice(1) : 'Payment'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(payment.created_at)}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {payment.id}
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={payment.status === "completed" ? "default" : "secondary"}
                              className="text-xs capitalize"
                            >
                              {payment.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                  ))}
                  {(!selectedSubscription?.payments || selectedSubscription.payments.length === 0) && (
                    <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg">
                      No payment history available
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {selectedSubscription?.payments && selectedSubscription.payments.length > paymentsPerPage && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {Math.ceil(selectedSubscription.payments.length / paymentsPerPage)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(selectedSubscription.payments.length / paymentsPerPage)))}
                      disabled={currentPage === Math.ceil(selectedSubscription.payments.length / paymentsPerPage)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Selected Subscription Details */}
          {selectedSubscription && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Plan Details</CardTitle>
                  <CardDescription>{selectedSubscription.plan.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Features</h3>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Delivery Limit</span>
                        <span className="font-medium">{selectedSubscription.plan.delivery_limit}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Drivers Limit</span>
                        <span className="font-medium">{selectedSubscription.plan.drivers_limit}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>AI Suggestions</span>
                        <Badge className='capitalize' variant={selectedSubscription.plan.ai_suggestions ? "default" : "secondary"}>
                          {selectedSubscription.plan.ai_suggestions ? "Enabled" : "Disabled"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="font-semibold">Additional Features</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubscription.plan.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className='capitalize'>
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h3 className="font-semibold">Latest Payment</h3>
                    {selectedSubscription.payments[0] && (
                      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <CreditCard className="h-4 w-4" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {formatCurrency(selectedSubscription.payments[0].amount)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(selectedSubscription.payments[0].created_at)}
                          </p>
                        </div>
                        <Badge className='capitalize' variant={selectedSubscription.payments[0].status === "completed" ? "default" : "secondary"}>
                          {selectedSubscription.payments[0].status}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
