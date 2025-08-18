"use client";

import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

interface Props {
  data: ExtractInvoiceDataOutput[];
}

const tableHeaders = [
  'Provider Name',
  'Invoice Number',
  'Invoice Date',
  'Provider Address',
  'Provider Phone',
  'Provider Email',
  'Invoice Value',
];

export function AllInvoicesDisplay({ data }: Props) {
  const [selectedInvoice, setSelectedInvoice] = useState<ExtractInvoiceDataOutput | null>(null);

  if (data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
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
          <CardTitle>All Invoices (Sorted by Date)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  {tableHeaders.map((header) => (
                    <TableHead key={header}>{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((invoice, index) => (
                  <TableRow key={`${invoice.invoiceNumber}-${invoice.invoiceDate}-${index}`} onClick={() => setSelectedInvoice(invoice)} className="cursor-pointer">
                    <TableCell>{invoice.providerName || "N/A"}</TableCell>
                    <TableCell>{invoice.invoiceNumber || "N/A"}</TableCell>
                    <TableCell>{invoice.invoiceDate || "N/A"}</TableCell>
                    <TableCell>{invoice.providerAddress || "N/A"}</TableCell>
                    <TableCell>{invoice.providerPhone || "N/A"}</TableCell>
                    <TableCell>{invoice.providerEmail || "N/A"}</TableCell>
                    <TableCell className="text-right">{invoice.invoiceValue || "N/A"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
