import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Bill, Customer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { PlusCircle, Users, Receipt, DollarSign } from "lucide-react";
import { formatIndianCurrency } from "@/lib/utils";

export default function Dashboard() {
  const { data: customers } = useQuery<Customer[]>({ queryKey: ["/api/customers"] });
  const { data: bills } = useQuery<Bill[]>({ queryKey: ["/api/bills"] });

  const totalRevenue = bills?.reduce((sum, bill) => sum + Number(bill.total), 0) || 0;
  const unpaidBills = bills?.filter(bill => bill.status === "unpaid").length || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/create-bill">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Bill
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatIndianCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unpaid Bills</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unpaidBills}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bills?.slice(0, 5).map(bill => (
                <div key={bill.id} className="flex items-center justify-between p-2 border rounded">
                  <div>Bill #{bill.billNumber}</div>
                  <div className="flex items-center gap-4">
                    <span>{formatIndianCurrency(Number(bill.total))}</span>
                    <span className={`px-2 py-1 text-xs rounded ${
                      bill.status === "paid" ? "bg-green-100 text-green-800" :
                      bill.status === "unpaid" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {bill.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {customers?.slice(0, 5).map(customer => (
                <div key={customer.id} className="flex items-center justify-between p-2 border rounded">
                  <div>{customer.name}</div>
                  <div className="text-sm text-muted-foreground">{customer.email}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}