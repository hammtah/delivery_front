import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { format } from 'date-fns';

// Register a default font
Font.register({
  family: 'Helvetica',
  src: 'Helvetica'
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    borderBottom: '1 solid #e5e5e5',
    paddingBottom: 20
  },
  companyInfo: {
    flex: 1
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1a1a1a'
  },
  companyDetails: {
    fontSize: 10,
    color: '#666666',
    marginBottom: 2
  },
  invoiceInfo: {
    alignItems: 'flex-end'
  },
  invoiceNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5
  },
  invoiceDate: {
    fontSize: 10,
    color: '#666666'
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a'
  },
  billTo: {
    fontSize: 10,
    marginBottom: 5
  },
  table: {
    display: 'table',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderColor: '#e5e5e5'
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row'
  },
  tableColHeader: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e5e5',
    backgroundColor: '#f8f9fa',
    padding: 8
  },
  tableCol: {
    width: '25%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderColor: '#e5e5e5',
    padding: 8
  },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1a1a1a'
  },
  tableCell: {
    fontSize: 9,
    color: '#333333'
  },
  descriptionCell: {
    width: '40%'
  },
  amountCell: {
    width: '20%',
    textAlign: 'right'
  },
  commissionCell: {
    width: '20%',
    textAlign: 'right'
  },
  feesCell: {
    width: '20%',
    textAlign: 'right'
  },
  total: {
    marginTop: 20,
    alignItems: 'flex-end'
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a'
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #e5e5e5',
    textAlign: 'center'
  },
  footerText: {
    fontSize: 8,
    color: '#999999'
  },
  driverCommissions: {
    marginBottom: 20
  },
  driverRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottom: '1 solid #f0f0f0'
  },
  driverName: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  driverAmount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563eb'
  }
});

const InvoicePDF = ({ invoice, user }) => {
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

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
            amount: 0
          };
        }
        driverMap[driverId].amount += (delivery.commission/100 * delivery.fees);
      }
    });
    driverCommissions = Object.values(driverMap);
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{user ? user.name : 'Company Name'}</Text>
            <Text style={styles.companyDetails}>{user ? user.email : ''}</Text>
            <Text style={styles.companyDetails}>{user ? user.phone : ''}</Text>
          </View>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceNumber}>Invoice #{invoice.id}</Text>
            <Text style={styles.invoiceDate}>Date: {formatDate(invoice.invoice_date)}</Text>
          </View>
        </View>

        {/* Bill To (only for non-commission invoices) */}
        {invoice.invoice_type !== 'commission' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            {client ? (
              <View>
                <Text style={styles.billTo}>{client.name}</Text>
                <Text style={styles.billTo}>{client.email}</Text>
                <Text style={styles.billTo}>{client.phone}</Text>
              </View>
            ) : (
              <Text style={styles.billTo}>No client info</Text>
            )}
          </View>
        )}

        {/* Commission by Driver (for commission invoices) */}
        {invoice.invoice_type === 'commission' && driverCommissions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Commission Paid Per Driver</Text>
            <View style={styles.driverCommissions}>
              {driverCommissions.map((driver, idx) => (
                <View key={idx} style={styles.driverRow}>
                  <Text style={styles.driverName}>{driver.name}</Text>
                  <Text style={styles.driverAmount}>${driver.amount.toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Deliveries Table */}
        <View style={styles.section}>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableRow}>
              <View style={[styles.tableColHeader, styles.descriptionCell]}>
                <Text style={styles.tableCellHeader}>Description</Text>
              </View>
              <View style={[styles.tableColHeader, styles.commissionCell]}>
                <Text style={styles.tableCellHeader}>Commission</Text>
              </View>
              {invoice.invoice_type !== 'commission' && (
                <>
                  <View style={[styles.tableColHeader, styles.feesCell]}>
                    <Text style={styles.tableCellHeader}>Fees</Text>
                  </View>
                  <View style={[styles.tableColHeader, styles.amountCell]}>
                    <Text style={styles.tableCellHeader}>Total</Text>
                  </View>
                </>
              )}
            </View>

            {/* Table Rows */}
            {invoice.deliveries?.map((delivery, index) => (
              <View key={delivery.id} style={styles.tableRow}>
                <View style={[styles.tableCol, styles.descriptionCell]}>
                  <Text style={styles.tableCell}>
                    Delivery #{delivery.id} ({delivery.type.toUpperCase()})
                    {'\n'}Payment: {delivery.payment_type.toUpperCase()}
                    {'\n'}Driver: {delivery.driver?.user?.name || 'N/A'}
                    {invoice.invoice_type === 'commission' && delivery.client && delivery.client.user && (
                      `\nClient: ${delivery.client.user.email || ''}`
                    )}
                  </Text>
                </View>
                <View style={[styles.tableCol, styles.commissionCell]}>
                  <Text style={styles.tableCell}>${(delivery.commission/100 * delivery.fees).toFixed(2)}</Text>
                </View>
                {invoice.invoice_type !== 'commission' && (
                  <>
                    <View style={[styles.tableCol, styles.feesCell]}>
                      <Text style={styles.tableCell}>${delivery.fees.toFixed(2)}</Text>
                    </View>
                    <View style={[styles.tableCol, styles.amountCell]}>
                      <Text style={styles.tableCell}>${delivery.total_amount.toFixed(2)}</Text>
                    </View>
                  </>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Total */}
        <View style={styles.total}>
          <Text style={styles.totalAmount}>Grand Total: ${invoice.amount.toFixed(2)}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business.</Text>
        </View>
      </Page>
    </Document>
  );
};

export default InvoicePDF; 