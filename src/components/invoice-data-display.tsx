"use client";

import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportToExcel } from '@/lib/excel';
import { Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

interface Props {
  data: ExtractInvoiceDataOutput[];
  onDeleteInvoice: (invoiceNumber: string, invoiceDate: string) => void;
  onDeleteProvider: (providerName: string) => void;
}

const dataLabels: Record<keyof Omit<ExtractInvoiceDataOutput, 'providerName' | 'pdfDataUri'>, string> = {
  invoiceNumber: "Invoice Number",
  invoiceDate: "Invoice Date",
  providerAddress: "Provider Address",
  providerPhone: "Provider Phone",
  providerEmail: "Provider Email",
  invoiceValue: "Invoice Value"
};

export function InvoiceDataDisplay({ data, onDeleteInvoice, onDeleteProvider }: Props) {
  const { toast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<ExtractInvoiceDataOutput | null>(null);

  const handleExport = () => {
    try {
      if (data.length === 0) {
        toast({
          variant: "destructive",
          title: "No Data to Export",
          description: "There is no extracted data to export to Excel.",
        });
        return;
      }
      exportToExcel(data);
       toast({
        title: "Export Successful",
        description: "Your data has been exported to Excel.",
      });
    } catch (error) {
      console.error("Failed to export to Excel:", error);
       toast({
          variant: "destructive",
          title: "Export Failed",
          description: "There was a problem exporting your data to Excel.",
        });
    }
  };

  const groupedByProvider = data.reduce((acc, invoice) => {
    const provider = invoice.providerName || 'Unknown Provider';
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(invoice);
    return acc;
  }, {} as Record<string, ExtractInvoiceDataOutput[]>);


  if (data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Extracted Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No data has been extracted yet. Upload some invoices to get started.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Dialog open={!!selectedInvoice} onOpenChange={(isOpen) => !isOpen && setSelectedInvoice(null)}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Invoice Viewer</DialogTitle>
            <DialogDescription>
              Viewing invoice {selectedInvoice?.invoiceNumber} from {selectedInvoice?.providerName}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice?.pdfDataUri && (
             <iframe src={selectedInvoice.pdfDataUri} className="w-full h-full" title={`Invoice ${selectedInvoice.invoiceNumber}`} />
          )}
        </DialogContent>
      </Dialog>
      
      <Card className="w-full animate-in fade-in-50 duration-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Extracted Data</CardTitle>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export All to Excel
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedByProvider).map(([providerName, invoices]) => (
            <div key={providerName}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold tracking-tight text-primary">{providerName}</h3>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete All by {providerName}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete all invoices for {providerName}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDeleteProvider(providerName)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.values(dataLabels).map((label) => (
                        <TableHead key={label}>{label}</TableHead>
                      ))}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice, index) => (
                      <TableRow key={index} onClick={() => setSelectedInvoice(invoice)} className="cursor-pointer">
                        {(Object.keys(dataLabels) as Array<keyof typeof dataLabels>).map((key) => (
                          <TableCell key={key}>{invoice[key] || "N/A"}</TableCell>
                        ))}
                        <TableCell className="text-right">
                          <AlertDialog onOpenChange={e => e.stopPropagation()} >
                          <AlertDialogTrigger asChild onClick={e => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent onClick={e => e.stopPropagation()}>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action will permanently delete the invoice {invoice.invoiceNumber}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDeleteInvoice(invoice.invoiceNumber, invoice.invoiceDate)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
