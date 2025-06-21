'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import InvoicePDF from './InvoicePDF';
import { getApiUrl } from '@/utils/api';
// import Image from 'next/image';

export default function InvoiceDetailsPage() {
  const params = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        const response = await fetch(`${getApiUrl(`/api/invoice/${params.id}`)}`, {
          headers: {
            'authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        setInvoice(data.data);
      } catch (error) {
        console.error('Error fetching invoice details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetails();
  }, [params.id]);

  const handleDownloadPdf = async () => {
    if (!invoice) return;
    
    setPdfLoading(true);
    try {
      // Get authenticated user info from localStorage
      let user = null;
      if (typeof window !== 'undefined') {
        try {
          user = JSON.parse(localStorage.getItem('user'));
        } catch {}
      }

      const blob = await pdf(<InvoicePDF invoice={invoice} user={user} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoice.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setPdfLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!invoice) {
    return <div className="flex justify-center items-center min-h-screen">Invoice not found</div>;
  }

  // Get authenticated user info from localStorage
  let user = null;
  if (typeof window !== 'undefined') {
    try {
      user = JSON.parse(localStorage.getItem('user'));
    } catch {}
  }

  // Get first client info from deliveries (if any)
  const firstDelivery = invoice.deliveries?.[0];
  const client = firstDelivery?.client?.user || null;

  // Commission summary by driver (for commission invoices)
  let driverCommissions = [];
  if (invoice.invoice_type === 'commission' && Array.isArray(invoice.deliveries)) {
    const driverMap = {};
    invoice.deliveries.forEach(delivery => {
      if (delivery.driver && delivery.driver.user) {
        const driverId = delivery.driver.id;
        if (!driverMap[driverId]) {
          driverMap[driverId] = {
            name: delivery.driver.user.name,
            phone: delivery.driver.user.phone,
            image: delivery.driver.user.image,
            amount: 0
          };
        }
        // You may want to use delivery.commission or delivery.total_amount depending on your logic
        driverMap[driverId].amount += (delivery.commission/100 * delivery.fees) ;
      }
    });
    driverCommissions = Object.values(driverMap);
  }

  return (
    <div className="container mx-auto py-8 pl-64">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Meta/Summary */}
        {/* <div className="md:w-1/3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Invoice Number</div>
                <div className="font-semibold">#{invoice.id}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Type</div>
                <div className="capitalize">{invoice.invoice_type}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Invoice Date</div>
                <div>{formatDate(invoice.invoice_date)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                <div className="font-semibold text-lg">${invoice.amount.toFixed(2)}</div>
              </div>
            </CardContent>
          </Card>
          {invoice.invoice_type !== 'commission' && (
            <Card>
              <CardHeader>
                <CardTitle>Client</CardTitle>
              </CardHeader>
              <CardContent>
                {client ? (
                  <div className="space-y-1">
                    <div className="font-semibold">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.email}</div>
                    <div className="text-sm text-gray-500">{client.phone}</div>
                  </div>
                ) : (
                  <div className="text-gray-400">No client info</div>
                )}
              </CardContent>
            </Card>
          )}
        </div> */}

        {/* Right: Invoice Document */}
        <div className="md:w-2/3 mx-auto">
          <div className="flex justify-end mb-4">
            <Button onClick={handleDownloadPdf} disabled={loading || pdfLoading}>
              {loading ? 'Loading...' : pdfLoading ? 'Generating PDF...' : 'Download PDF'}
            </Button>
          </div>
          <div className="bg-white shadow-lg rounded-lg p-8 border min-h-[600px]">
            {/* Company/User Info */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
              <div>
                <div className="font-bold text-xl mb-1">{user ? user.name : 'User'}</div>
                <div className="text-sm text-gray-500">{user ? user.email : ''}</div>
                <div className="text-sm text-gray-500">{user ? user.phone : ''}</div>
              </div>
              <div className="mt-4 md:mt-0 text-right">
                <div className="text-xs text-gray-500">Invoice Number</div>
                <div className="font-semibold">#{invoice.id}</div>
                <div className="text-xs text-gray-500 mt-2">Date</div>
                <div>{formatDate(invoice.invoice_date)}</div>
              </div>
            </div>

            {/* Bill To (only for non-commission invoices) */}
            {invoice.invoice_type !== 'commission' && (
              <div className="mb-8">
                <div className="font-semibold mb-1">Bill To:</div>
                {client ? (
                  <div>
                    <div>{client.name}</div>
                    <div className="text-sm text-gray-500">{client.email}</div>
                    <div className="text-sm text-gray-500">{client.phone}</div>
                  </div>
                ) : (
                  <div className="text-gray-400">No client info</div>
                )}
              </div>
            )}

            {/* Commission by Driver (for commission invoices) */}
            {invoice.invoice_type === 'commission' && driverCommissions.length > 0 && (
              <div className="mb-8">
                <div className="font-semibold mb-2 text-lg">Commission Paid Per Driver</div>
                <table className="w-full border-t border-b text-sm mb-4">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2 font-medium">Driver</th>
                      <th className="py-2 font-medium">Phone</th>
                      <th className="py-2 font-medium">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driverCommissions.map((driver, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="py-2 flex items-center gap-2">
                          {driver.image && (
                            <img src={driver.image} alt={driver.name} className="w-6 h-6 rounded-full object-cover" />
                          )}
                          <span>{driver.name}</span>
                        </td>
                        <td className="py-2">{driver.phone}</td>
                        <td className="py-2 font-semibold text-primary">${driver.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table of Deliveries */}
            <div className="mb-8">
              <table className="w-full border-t border-b text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="py-2 font-medium">Description</th>
                    <th className="py-2 font-medium">Commission</th>
                    {invoice.invoice_type !== 'commission' && (
                        <>
                    <th className="py-2 font-medium">Fees</th>
                    <th className="py-2 font-medium">Total</th>
                        </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {invoice.deliveries?.map((delivery) => (
                    <tr key={delivery.id} className="border-t">
                      <td className="py-2">
                        Delivery #{delivery.id} ({delivery.type.toUpperCase()})<br />
                        Payment: {delivery.payment_type.toUpperCase()}<br />
                        Driver: {delivery.driver?.user?.name || 'N/A'}<br />
                        {/* For commission invoices, show client info in description */}
                        {invoice.invoice_type === 'commission' && delivery.client && delivery.client.user && (
                          <div className="text-xs text-gray-500 mt-1">
                            Client: {delivery.client.user.email ? `${delivery.client.user.email}` : '' }
                          </div>
                        )}
                      </td>
                      <td className="py-2">${(delivery.commission/100 * delivery.fees).toFixed(2)}</td>
                      {invoice.invoice_type !== 'commission' && (
                        <>
                      <td className="py-2">${delivery.fees.toFixed(2)}</td>
                      <td className="py-2">${delivery.total_amount.toFixed(2)}</td>
                      </>
                    )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Grand Total */}
            <div className="flex justify-end items-center mb-8">
              <div className="text-lg font-bold">Grand Total: ${invoice.amount.toFixed(2)}</div>
            </div>

            {/* Optional Note/Signature */}
            <div className="mt-12 text-xs text-gray-400 border-t pt-4">
              Thank you for your business.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 