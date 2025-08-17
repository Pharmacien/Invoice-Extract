"use client";

import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import * as XLSX from 'xlsx';

export const exportToExcel = (data: ExtractInvoiceDataOutput, fileName?: string) => {
  const worksheetData = [
    ["Field", "Value"],
    ['Invoice Number', data.invoiceNumber],
    ['Invoice Date', data.invoiceDate],
    ['Provider Name', data.providerName],
    ['Provider Address', data.providerAddress],
    ['Provider Phone', data.providerPhone],
    ['Provider Email', data.providerEmail],
    ['Invoice Value', data.invoiceValue],
  ];

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Set column widths for better readability
  ws['!cols'] = [{ wch: 20 }, { wch: 50 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Invoice Data");

  // Generate a filename
  const finalFileName = fileName || `invoice-${data.invoiceNumber || 'data'}.xlsx`;

  // Trigger the download
  XLSX.writeFile(wb, finalFileName);
};
