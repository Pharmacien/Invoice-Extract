"use client";

import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import * as XLSX from 'xlsx';

export const exportToExcel = (data: ExtractInvoiceDataOutput[], fileName: string = 'invoices-data.xlsx') => {
  const wb = XLSX.utils.book_new();

  // Group data by provider name
  const groupedByProvider: { [key: string]: ExtractInvoiceDataOutput[] } = data.reduce((acc, invoice) => {
    const provider = invoice.providerName || 'Unknown Provider';
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(invoice);
    return acc;
  }, {} as { [key: string]: ExtractInvoiceDataOutput[] });

  const header = [
    'Invoice Number',
    'Invoice Date',
    'Provider Name',
    'Provider Address',
    'Provider Phone',
    'Provider Email',
    'Invoice Value',
  ];

  // Create a sheet for each provider
  for (const providerName in groupedByProvider) {
    const invoices = groupedByProvider[providerName];
    const worksheetData = [
      header,
      ...invoices.map(invoice => [
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

    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, 
      { wch: 20 }, 
      { wch: 30 }, 
      { wch: 50 }, 
      { wch: 20 }, 
      { wch: 30 }, 
      { wch: 20 }
    ];

    // Sheet names have a 31-character limit and cannot contain certain characters.
    const safeSheetName = providerName.replace(/[:\\/?*[\]]/g, '').substring(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  }

  // Trigger the download
  XLSX.writeFile(wb, fileName);
};
