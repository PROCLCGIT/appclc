import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form validation schema
const transactionSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters"),
  amount: z.string().refine(val => !isNaN(val) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  type: z.enum(["debit", "credit"]),
  category: z.string().min(1, "Please select a category"),
  date: z.date({
    required_error: "Please select a date",
  }),
});

const accountingFormSchema = z.object({
  transactions: z.array(transactionSchema).min(1, "At least one transaction is required"),
  notes: z.string().optional(),
  receipt: z.instanceof(FileList).optional(),
  paymentMethod: z.string().min(1, "Please select a payment method"),
});

export default function ExpenseControlForm2() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("form");
  const [transactions, setTransactions] = useState([]);
  
  const form = useForm({
    resolver: zodResolver(accountingFormSchema),
    defaultValues: {
      transactions: [
        {
          description: "",
          amount: "",
          type: "debit",
          category: "",
          date: new Date(),
        }
      ],
      notes: "",
      paymentMethod: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "transactions",
  });

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Convert amounts to numbers and prepare data
      const formattedData = {
        ...data,
        transactions: data.transactions.map(transaction => ({
          ...transaction,
          amount: parseFloat(transaction.amount),
        })),
      };
      
      // Here you would typically make an API call
      console.log("Submitting accounting entries:", formattedData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add to transaction history
      setTransactions([
        ...formattedData.transactions.map(t => ({
          ...t,
          paymentMethod: formattedData.paymentMethod,
          timestamp: new Date(),
        })),
        ...transactions
      ]);
      
      toast.success("Entries saved successfully!");
      // Reset form but keep the first empty transaction
      form.reset({
        transactions: [
          {
            description: "",
            amount: "",
            type: "debit",
            category: "",
            date: new Date(),
          }
        ],
        notes: "",
        paymentMethod: "",
      });
      
      // Switch to transaction history tab
      setActiveTab("history");
    } catch (error) {
      console.error("Error saving entries:", error);
      toast.error("Failed to save entries. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addNewTransaction = () => {
    append({
      description: "",
      amount: "",
      type: "debit",
      category: "",
      date: new Date(),
    });
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalDebit = 0;
    let totalCredit = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === "debit") {
        totalDebit += transaction.amount;
      } else {
        totalCredit += transaction.amount;
      }
    });
    
    return { totalDebit, totalCredit, balance: totalCredit - totalDebit };
  };

  const { totalDebit, totalCredit, balance } = calculateTotals();

  return (
    <div className="container mx-auto py-8">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form">New Entries</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="form">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Accounting Ledger</CardTitle>
              <CardDescription>
                Record debits and credits for your financial transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Transactions</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={addNewTransaction}
                      className="flex items-center"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Entry
                    </Button>
                  </div>
                  
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {fields.map((field, index) => (
                          <TableRow key={field.id}>
                            <TableCell>
                              <Input
                                placeholder="Description"
                                {...form.register(`transactions.${index}.description`)}
                              />
                              {form.formState.errors.transactions?.[index]?.description && (
                                <p className="text-xs text-red-500 mt-1">
                                  {form.formState.errors.transactions[index].description.message}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Select 
                                onValueChange={(value) => form.setValue(`transactions.${index}.type`, value)}
                                defaultValue={field.type}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="debit">Debe</SelectItem>
                                  <SelectItem value="credit">Haber</SelectItem>
                                </SelectContent>
                              </Select>
                              {form.formState.errors.transactions?.[index]?.type && (
                                <p className="text-xs text-red-500 mt-1">
                                  {form.formState.errors.transactions[index].type.message}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Select 
                                onValueChange={(value) => form.setValue(`transactions.${index}.category`, value)}
                                defaultValue={field.category}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sales">Sales</SelectItem>
                                  <SelectItem value="purchases">Purchases</SelectItem>
                                  <SelectItem value="rent">Rent</SelectItem>
                                  <SelectItem value="salaries">Salaries</SelectItem>
                                  <SelectItem value="utilities">Utilities</SelectItem>
                                  <SelectItem value="insurance">Insurance</SelectItem>
                                  <SelectItem value="taxes">Taxes</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              {form.formState.errors.transactions?.[index]?.category && (
                                <p className="text-xs text-red-500 mt-1">
                                  {form.formState.errors.transactions[index].category.message}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="relative">
                                <span className="absolute left-3 top-2.5">$</span>
                                <Input
                                  type="text"
                                  placeholder="0.00"
                                  className="pl-7"
                                  {...form.register(`transactions.${index}.amount`)}
                                />
                              </div>
                              {form.formState.errors.transactions?.[index]?.amount && (
                                <p className="text-xs text-red-500 mt-1">
                                  {form.formState.errors.transactions[index].amount.message}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {form.getValues(`transactions.${index}.date`) 
                                      ? format(form.getValues(`transactions.${index}.date`), "PP")
                                      : "Pick a date"}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                  <Calendar
                                    mode="single"
                                    selected={form.getValues(`transactions.${index}.date`)}
                                    onSelect={(date) => form.setValue(`transactions.${index}.date`, date)}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              {form.formState.errors.transactions?.[index]?.date && (
                                <p className="text-xs text-red-500 mt-1">
                                  {form.formState.errors.transactions[index].date.message}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                disabled={fields.length === 1}
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select onValueChange={(value) => form.setValue("paymentMethod", value)}>
                        <SelectTrigger id="paymentMethod">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="creditCard">Credit Card</SelectItem>
                          <SelectItem value="debitCard">Debit Card</SelectItem>
                          <SelectItem value="bankTransfer">Bank Transfer</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.paymentMethod && (
                        <p className="text-sm text-red-500">{form.formState.errors.paymentMethod.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="receipt">Receipt (optional)</Label>
                      <Input 
                        id="receipt" 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={(e) => form.setValue("receipt", e.target.files)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional details about these transactions..."
                      rows={3}
                      {...form.register("notes")}
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => form.reset()}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Entries"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Transaction History</CardTitle>
              <CardDescription>
                View and manage your accounting entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead className="text-right">Debe</TableHead>
                      <TableHead className="text-right">Haber</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length > 0 ? (
                      transactions.map((transaction, index) => (
                        <TableRow key={index}>
                          <TableCell>{format(transaction.date, "PP")}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.category}</TableCell>
                          <TableCell>{transaction.paymentMethod}</TableCell>
                          <TableCell className="text-right">
                            {transaction.type === "debit" ? `$${transaction.amount.toFixed(2)}` : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {transaction.type === "credit" ? `$${transaction.amount.toFixed(2)}` : "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No transactions yet. Add some in the "New Entries" tab.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {transactions.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-2">Total Debit (Debe)</h3>
                      <p className="text-2xl font-bold">${totalDebit.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-medium mb-2">Total Credit (Haber)</h3>
                      <p className="text-2xl font-bold">${totalCredit.toFixed(2)}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 relative">
                      <h3 className="font-medium mb-2">Balance</h3>
                      <p className={cn(
                        "text-2xl font-bold",
                        balance > 0 ? "text-green-600" : balance < 0 ? "text-red-600" : ""
                      )}>
                        ${balance.toFixed(2)}
                      </p>
                      {balance !== 0 && (
                        <span className="absolute top-3 right-3 text-xs font-medium rounded-full px-2 py-1 bg-gray-100">
                          {balance > 0 ? "SURPLUS" : "DEFICIT"}
                        </span>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
            <CardFooter className="justify-center">
              <Button variant="outline" onClick={() => setActiveTab("form")}>
                Add New Entries
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}