import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlusCircle, FileText, Printer } from "lucide-react";
import type { Invoice, Customer } from "@shared/schema";
import { InvoicePDF } from "@/components/invoice-pdf";

export default function Invoices() {
  const { data: invoices, isLoading: loadingInvoices } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: customers } = useQuery<Customer[]>({
    queryKey: ["/api/customers"],
  });

  const getCustomerName = (customerId: number) => {
    return customers?.find(c => c.id === customerId)?.name || 'Unknown Customer';
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Link href="/invoices/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </Link>
      </div>

      {loadingInvoices ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {invoices?.map((invoice) => (
            <Card key={invoice.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg">
                  Invoice #{invoice.number}
                </CardTitle>
                <InvoicePDF invoice={invoice} customer={customers?.find(c => c.id === invoice.customerId)}>
                  <Button variant="outline" size="sm">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </InvoicePDF>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Customer</div>
                    <div>{getCustomerName(invoice.customerId)}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Issue Date</div>
                    <div>{new Date(invoice.issueDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Due Date</div>
                    <div>{new Date(invoice.dueDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Total Amount</div>
                    <div className="text-lg font-bold">${Number(invoice.total).toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
