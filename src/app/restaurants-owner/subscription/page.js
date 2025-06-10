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
import { Calendar, CreditCard, Package, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
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
  }, []);

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
    }).format(amount / 100);
  };

  const handleSubscribe = (subscription) => {
    router.push(`/restaurants-owner/payment?subscription_id=${subscription.sub_id}`);
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 ml-0 md:ml-64 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Manage
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Subscriptions Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Subscriptions</CardTitle>
                <CardDescription>View and manage your subscription plans</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => (
                      <TableRow 
                        key={subscription.sub_id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedSubscription(subscription)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            {subscription.plan.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={subscription.status === "active" ? "default" : "secondary"}>
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
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSubscribe(subscription);
                            }}
                          >
                            Subscribe
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
                        <Badge variant={selectedSubscription.plan.ai_suggestions ? "default" : "secondary"}>
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
                        <Badge key={index} variant="outline">
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
                        <Badge variant={selectedSubscription.payments[0].status === "completed" ? "default" : "secondary"}>
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
