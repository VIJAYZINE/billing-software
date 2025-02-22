import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Bill } from "@shared/schema";
import { formatIndianCurrency } from "@/lib/utils";

export default function StockSummary() {
  const { data: bills } = useQuery<Bill[]>({ queryKey: ["/api/bills"] });

  // Aggregate items from all bills
  const stockSummary = bills?.reduce((acc, bill) => {
    (bill.items as string[]).forEach(itemStr => {
      const item = JSON.parse(itemStr);
      if (!acc[item.description]) {
        acc[item.description] = {
          totalQuantity: 0,
          totalValue: 0
        };
      }
      acc[item.description].totalQuantity += item.quantity;
      acc[item.description].totalValue += (item.quantity * item.price);
    });
    return acc;
  }, {} as Record<string, { totalQuantity: number; totalValue: number }>);

  const totalInventoryValue = Object.values(stockSummary || {})
    .reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Stock Summary Report</h1>

      <Card>
        <CardHeader>
          <CardTitle>Total Inventory Value: {formatIndianCurrency(totalInventoryValue)}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-4 font-bold border-b pb-2">
              <div>Item Description</div>
              <div className="text-right">Quantity</div>
              <div className="text-right">Unit Value</div>
              <div className="text-right">Total Value</div>
            </div>
            {Object.entries(stockSummary || {}).map(([description, data]) => (
              <div key={description} className="grid grid-cols-4 items-center">
                <div>{description}</div>
                <div className="text-right">{data.totalQuantity}</div>
                <div className="text-right">
                  {formatIndianCurrency(data.totalValue / data.totalQuantity)}
                </div>
                <div className="text-right">{formatIndianCurrency(data.totalValue)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
