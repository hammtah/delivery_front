'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CommissionsList from './components/CommissionsList';
import CODList from './components/CODList';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState('commissions');

  return (
    <div className="p-6 ml-64">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Invoices</h1>
        <Link href='/restaurants-owner/invoice'>
            <Button variant="outline" className="mb-4">
            <span className="text-sm">View Invoices</span>
            </Button>
        </Link>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
            <TabsTrigger value="cod">COD Deliveries</TabsTrigger>
            <TabsTrigger value="drivers">Drivers Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="commissions">
            <CommissionsList />
          </TabsContent>

          <TabsContent value="cod">
            <CODList />
          </TabsContent>

          <TabsContent value="drivers">
            <div className="text-center py-10">
              <p className="text-gray-500">Drivers Payment section coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
