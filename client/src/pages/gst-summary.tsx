import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Bill } from "@shared/schema";
import { formatIndianCurrency, calculateGST } from "@/lib/utils";

export default function GSTSummary() {
  const { data: bills } = useQuery<Bill[]>({ queryKey: ["/api/bills"] });

  const gstSummary = bills?.reduce((acc, bill) => {
    const subtotal = parseFloat(bill.subtotal);
    const gst = calculateGST(subtotal);
    
    return {
      totalSubtotal: acc.totalSubtotal + subtotal,
      totalCGST: acc.totalCGST + gst.cgst,
      totalSGST: acc.totalSGST + gst.sgst,
      totalAmount: acc.totalAmount + gst.total
    };
  }, {
    totalSubtotal: 0,
    totalCGST: 0,
    totalSGST: 0,
    totalAmount: 0
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">GST Summary Report</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Overall Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Taxable Value:</span>
                <span className="font-bold">{formatIndianCurrency(gstSummary?.totalSubtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total CGST (9%):</span>
                <span className="font-bold">{formatIndianCurrency(gstSummary?.totalCGST || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total SGST (9%):</span>
                <span className="font-bold">{formatIndianCurrency(gstSummary?.totalSGST || 0)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Total Amount:</span>
                <span className="font-bold">{formatIndianCurrency(gstSummary?.totalAmount || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bills?.reduce((acc, bill) => {
                const month = new Date(bill.date).toLocaleString('default', { month: 'long', year: 'numeric' });
                if (!acc[month]) {
                  acc[month] = {
                    taxable: 0,
                    cgst: 0,
                    sgst: 0
                  };
                }
                const subtotal = parseFloat(bill.subtotal);
                const gst = calculateGST(subtotal);
                acc[month].taxable += subtotal;
                acc[month].cgst += gst.cgst;
                acc[month].sgst += gst.sgst;
                return acc;
              }, {} as Record<string, { taxable: number; cgst: number; sgst: number }>)
                ?.map((monthData, month) => (
                  <div key={month} className="border-b pb-2">
                    <div className="font-bold">{month}</div>
                    <div className="grid grid-cols-3 gap-2 mt-1 text-sm">
                      <div>
                        <div className="text-muted-foreground">Taxable</div>
                        <div>{formatIndianCurrency(monthData.taxable)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">CGST</div>
                        <div>{formatIndianCurrency(monthData.cgst)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">SGST</div>
                        <div>{formatIndianCurrency(monthData.sgst)}</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
