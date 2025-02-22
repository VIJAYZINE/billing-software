import { useQuery, useMutation } from "@tanstack/react-query";
import { Bill, Customer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { PlusCircle } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { formatIndianCurrency } from "@/lib/utils";

export default function Bills() {
  const { toast } = useToast();
  const { data: bills } = useQuery<Bill[]>({ queryKey: ["/api/bills"] });
  const { data: customers } = useQuery<Customer[]>({ queryKey: ["/api/customers"] });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest("PATCH", `/api/bills/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      toast({ title: "Success", description: "Bill status updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update bill status", variant: "destructive" });
    },
  });

  const getCustomerName = (customerId: number) => {
    return customers?.find(c => c.id === customerId)?.name || "Unknown Customer";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bills</h1>
        <Link href="/create-bill">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Bill
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {bills?.map((bill) => (
          <Card key={bill.id}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-medium">Bill #{bill.billNumber}</div>
                  <div className="text-sm text-muted-foreground">{getCustomerName(bill.customerId)}</div>
                </div>

                <div className="space-y-1 text-right">
                  <div className="font-medium">{formatIndianCurrency(Number(bill.total))}</div>
                  <div className="text-sm text-muted-foreground">
                    Due: {format(new Date(bill.dueDate), "MMM d, yyyy")}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Select
                    defaultValue={bill.status}
                    onValueChange={(value) => updateStatus.mutate({ id: bill.id, status: value })}
                  >
                    <SelectTrigger className={`w-[120px] ${getStatusColor(bill.status)}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium">Items:</div>
                <div className="mt-2 space-y-2">
                  {bill.items.map((itemStr, index) => {
                    const item = JSON.parse(itemStr);
                    return (
                      <div key={index} className="text-sm grid grid-cols-4 gap-2">
                        <span>{item.description} (x{item.quantity})</span>
                        <span className="text-right">{formatIndianCurrency(item.price)}</span>
                        <span className="text-right">GST: {item.gstRate}%</span>
                        <span className="text-right">{formatIndianCurrency(item.price * item.quantity)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 pt-4 border-t space-y-1">
                  <div className="text-sm flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatIndianCurrency(Number(bill.subtotal))}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span>CGST</span>
                    <span>{formatIndianCurrency(Number(bill.cgst))}</span>
                  </div>
                  <div className="text-sm flex justify-between">
                    <span>SGST</span>
                    <span>{formatIndianCurrency(Number(bill.sgst))}</span>
                  </div>
                  <div className="text-sm font-medium flex justify-between">
                    <span>Total</span>
                    <span>{formatIndianCurrency(Number(bill.total))}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}