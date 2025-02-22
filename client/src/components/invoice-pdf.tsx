import { useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";
import type { Invoice, Customer } from "@shared/schema";

interface InvoicePDFProps {
  invoice: Invoice;
  customer?: Customer;
  children?: React.ReactNode;
}

export function InvoicePDF({ invoice, customer, children }: InvoicePDFProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!invoiceRef.current) return;

    const canvas = await html2canvas(invoiceRef.current, {
      scale: 2,
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice-${invoice.number}.pdf`);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString();
  };

  const formatCurrency = (amount: number | string) => {
    return `$${Number(amount).toFixed(2)}`;
  };

  return (
    <>
      <div className="sr-only">
        <div ref={invoiceRef} className="p-8 bg-white text-black">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-2">INVOICE</h1>
              <div className="text-sm">
                <div>Invoice #: {invoice.number}</div>
                <div>Issue Date: {formatDate(invoice.issueDate.toString())}</div>
                <div>Due Date: {formatDate(invoice.dueDate.toString())}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold mb-2">Your Business Name</div>
              <div className="text-sm">
                <div>123 Business Street</div>
                <div>City, State 12345</div>
                <div>Phone: (555) 555-5555</div>
                <div>Email: business@example.com</div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-8">
            <div className="text-sm font-bold mb-2">Bill To:</div>
            <div className="text-sm">
              <div>{customer?.name}</div>
              <div>{customer?.address}</div>
              <div>{customer?.email}</div>
              <div>{customer?.phone}</div>
            </div>
          </div>

          {/* Invoice Items */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Quantity</th>
                <th className="text-right py-2">Unit Price</th>
                <th className="text-right py-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Sample items - in a real app, these would come from the invoice */}
              <tr className="border-b">
                <td className="py-2">Sample Item</td>
                <td className="text-right py-2">1</td>
                <td className="text-right py-2">{formatCurrency(invoice.subtotal)}</td>
                <td className="text-right py-2">{formatCurrency(invoice.subtotal)}</td>
              </tr>
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-1/3">
              <div className="flex justify-between mb-2">
                <div>Subtotal:</div>
                <div>{formatCurrency(invoice.subtotal)}</div>
              </div>
              <div className="flex justify-between mb-2">
                <div>Tax:</div>
                <div>{formatCurrency(invoice.tax)}</div>
              </div>
              <div className="flex justify-between font-bold">
                <div>Total:</div>
                <div>{formatCurrency(invoice.total)}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t text-sm text-center text-gray-600">
            Thank you for your business!
          </div>
        </div>
      </div>

      {/* Trigger Button */}
      <div onClick={generatePDF} className="cursor-pointer">
        {children}
      </div>
    </>
  );
}