"use client";

import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import * as XLSX from 'xlsx';

export const exportToExcel = (data: ExtractInvoiceDataOutput[], fileName?: string) => {
  const header = [
    'Invoice Number',
    'Invoice Date',
    'Provider Name',
    'Provider Address',
    'Provider Phone',
    'Provider Email',
    'Invoice Value',
  ];

  const worksheetData = [
    header,
    ...data.map(invoice => [
      invoice.invoiceNumber,
      invoice.invoiceDate,
      invoice.providerName,
      invoice.providerAddress,
      invoice.providerPhone,
      invoice.providerEmail,
      invoice.invoiceValue,
    ]),
  ];

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths for better readability
  ws['!cols'] = [
    { wch: 20 }, 
    { wch: 20 }, 
    { wch: 30 }, 
    { wch: 50 }, 
    { wch: 20 }, 
    { wch: 30 }, 
    { wch: 20 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Invoices Data");

  // Generate a filename
  const finalFileName = fileName || `invoices-data-${new Date().toISOString().split('T')[0]}.xlsx`;

  // Trigger the download
  XLSX.writeFile(wb, finalFileName);
};
