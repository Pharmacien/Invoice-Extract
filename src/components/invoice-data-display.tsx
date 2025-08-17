"use client";

import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportToExcel } from '@/lib/excel';
import { Download } from 'lucide-react';

interface Props {
  data: ExtractInvoiceDataOutput;
}

const dataLabels: Record<keyof ExtractInvoiceDataOutput, string> = {
  invoiceNumber: "Invoice Number",
  invoiceDate: "Invoice Date",
  providerName: "Provider Name",
  providerAddress: "Provider Address",
  providerPhone: "Provider Phone",
  providerEmail: "Provider Email",
  invoiceValue: "Invoice Value"
};

export function InvoiceDataDisplay({ data }: Props) {
  const handleExport = () => {
    try {
      exportToExcel(data);
    } catch (error) {
      console.error("Failed to export to Excel:", error);
    }
  };

  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Extracted Data</CardTitle>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export to Excel
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Field</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(Object.keys(dataLabels) as Array<keyof ExtractInvoiceDataOutput>).map((key) => (
              <TableRow key={key}>
                <TableCell className="font-medium">{dataLabels[key]}</TableCell>
                <TableCell>{data[key] || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
