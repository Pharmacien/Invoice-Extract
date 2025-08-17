'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting data from Slovenian PDF invoices.
 *
 * The flow uses an LLM to identify and extract key information such as invoice number,
 * date, provider details (name, address, phone, email), and invoice value.
 *
 * @exports {
 *   extractInvoiceData: (input: ExtractInvoiceDataInput) => Promise<ExtractInvoiceDataOutput>;
 *   ExtractInvoiceDataInput: type
 *   ExtractInvoiceDataOutput: type
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const ExtractInvoiceDataInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      'The PDF invoice data as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' 
    ),
});
export type ExtractInvoiceDataInput = z.infer<typeof ExtractInvoiceDataInputSchema>;

const ExtractInvoiceDataOutputSchema = z.object({
  invoiceNumber: z.string().describe('The invoice number.'),
  invoiceDate: z.string().describe('The date of the invoice.'),
  providerName: z.string().describe('The name of the provider.'),
  providerAddress: z.string().describe('The address of the provider.'),
  providerPhone: z.string().describe('The phone number of the provider.'),
  providerEmail: z.string().describe('The email address of the provider.'),
  invoiceValue: z.string().describe('The total value of the invoice.'),
});

export type ExtractInvoiceDataOutput = z.infer<typeof ExtractInvoiceDataOutputSchema>;

export async function extractInvoiceData(input: ExtractInvoiceDataInput): Promise<ExtractInvoiceDataOutput> {
  return extractInvoiceDataFlow(input);
}

const extractInvoiceDataPrompt = ai.definePrompt({
  name: 'extractInvoiceDataPrompt',
  input: {schema: ExtractInvoiceDataInputSchema},
  output: {schema: ExtractInvoiceDataOutputSchema},
  prompt: `You are an expert data extraction specialist, specializing in invoices written in Slovenian.

  Given a PDF invoice, extract the following information:
  - Invoice Number
  - Invoice Date
  - Provider Name
  - Provider Address
  - Provider Phone
  - Provider Email
  - Invoice Value

  Here is the invoice data:
  {{media url=pdfDataUri}}

  Ensure all fields are accurately extracted and formatted.
  Return a JSON object with the extracted data.`,
});

const extractInvoiceDataFlow = ai.defineFlow(
  {
    name: 'extractInvoiceDataFlow',
    inputSchema: ExtractInvoiceDataInputSchema,
    outputSchema: ExtractInvoiceDataOutputSchema,
  },
  async input => {
    const {output} = await extractInvoiceDataPrompt(input);
    return output!;
  }
);
