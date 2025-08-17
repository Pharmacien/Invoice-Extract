'use server';

import { promises as fs } from 'fs';
import path from 'path';
import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'src', 'data');
const dataFilePath = path.join(dataDir, 'invoices.json');

async function ensureDataFileExists() {
    try {
        await fs.mkdir(dataDir, { recursive: true });
        await fs.access(dataFilePath);
    } catch (error: any) {
        if (error.code === 'ENOENT') {
            await fs.writeFile(dataFilePath, '[]', 'utf-8');
        } else {
            throw error;
        }
    }
}

async function readData(): Promise<ExtractInvoiceDataOutput[]> {
  await ensureDataFileExists();
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    if (!fileContent) {
        return [];
    }
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading data file:", error);
    return [];
  }
}

async function writeData(data: ExtractInvoiceDataOutput[]): Promise<void> {
  await ensureDataFileExists();
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getExtractedData(): Promise<ExtractInvoiceDataOutput[]> {
  return await readData();
}

export async function appendExtractedData(newData: ExtractInvoiceDataOutput[]): Promise<void> {
  const existingData = await readData();
  const dataMap = new Map<string, ExtractInvoiceDataOutput>();

  // Populate map with existing data
  existingData.forEach(invoice => {
    const key = `${invoice.invoiceNumber}-${invoice.invoiceDate}`;
    dataMap.set(key, invoice);
  });

  // Add or update with new data
  newData.forEach(invoice => {
    const key = `${invoice.invoiceNumber}-${invoice.invoiceDate}`;
    dataMap.set(key, invoice);
  });

  const updatedData = Array.from(dataMap.values());
  await writeData(updatedData);
}
