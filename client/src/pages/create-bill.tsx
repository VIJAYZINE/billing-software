import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { insertBillSchema, Customer } from "@shared/schema";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { formatIndianCurrency } from "@/lib/utils";

const GST_RATES = [0, 5, 12, 18, 28];

export default function CreateBill() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [items, setItems] = useState<Array<{ description: string; quantity: number; price: number; gstRate: number }>>([]);
  const { data: customers } = useQuery<Customer[]>({ queryKey: ["/api/customers"] });

  const form = useForm({
    resolver: zodResolver(insertBillSchema),
    defaultValues: {
      customerId: 0,
      billNumber: `BILL-${Date.now()}`,
      date: new Date(),
      dueDate: new Date(),
      subtotal: 0,
      gstRate: 18,
      cgst: 0,
      sgst: 0,
      total: 0,
      status: "unpaid",
      items: [],
    },
  });

  const createBill = useMutation({
    mutationFn: async (data: unknown) => {
      await apiRequest("POST", "/api/bills", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bills"] });
      navigate("/bills");
      toast({ title: "Success", description: "Bill created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create bill", variant: "destructive" });
    },
  });

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, price: 0, gstRate: 18 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof typeof items[0], value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);

    const subtotal = newItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const gstCalculations = newItems.reduce((acc, item) => {
      const itemTotal = item.quantity * item.price;
      const gstAmount = (itemTotal * item.gstRate) / 100;
      return {
        cgst: acc.cgst + (gstAmount / 2),
        sgst: acc.sgst + (gstAmount / 2)
      };
    }, { cgst: 0, sgst: 0 });

    const total = subtotal + gstCalculations.cgst + gstCalculations.sgst;

    form.setValue("subtotal", subtotal);
    form.setValue("cgst", gstCalculations.cgst);
    form.setValue("sgst", gstCalculations.sgst);
    form.setValue("total", total);
    form.setValue("items", newItems.map(item => JSON.stringify(item)));
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Create New Bill</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => createBill.mutate(data))} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Bill Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers?.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bill Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bill Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className="w-full">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button variant="outline" className="w-full">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? format(field.value, "PPP") : "Pick a date"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent>
                          <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Items</CardTitle>
                <Button type="button" onClick={addItem}>Add Item</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid gap-4 md:grid-cols-5 items-end">
                    <Input
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                    />
                    <Input
                      type="number"
                      placeholder="Price"
                      value={item.price}
                      onChange={(e) => updateItem(index, "price", parseFloat(e.target.value))}
                    />
                    <Select
                      value={item.gstRate.toString()}
                      onValueChange={(value) => updateItem(index, "gstRate", parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="GST Rate" />
                      </SelectTrigger>
                      <SelectContent>
                        {GST_RATES.map((rate) => (
                          <SelectItem key={rate} value={rate.toString()}>
                            {rate}%
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="destructive" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatIndianCurrency(form.getValues("subtotal"))}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST</span>
                  <span>{formatIndianCurrency(form.getValues("cgst"))}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST</span>
                  <span>{formatIndianCurrency(form.getValues("sgst"))}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatIndianCurrency(form.getValues("total"))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={createBill.isPending}>
            Create Bill
          </Button>
        </form>
      </Form>
    </div>
  );
}