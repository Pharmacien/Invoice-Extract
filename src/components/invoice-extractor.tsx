"use client";

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { extractInvoiceData, type ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Loader2, AlertCircle } from 'lucide-react';
import { InvoiceDataDisplay } from './invoice-data-display';
import { InvoiceDataSkeleton } from './invoice-data-skeleton';

const toDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });

export function InvoiceExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractInvoiceDataOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        setError("Please upload a PDF file.");
        toast({ variant: "destructive", title: "Invalid File Type", description: "Only PDF files are accepted." });
        setFile(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size should not exceed 5MB.");
        toast({ variant: "destructive", title: "File Too Large", description: "Please upload a file smaller than 5MB." });
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setExtractedData(null);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setExtractedData(null);

    try {
      const pdfDataUri = await toDataURL(file);
      const result = await extractInvoiceData({ pdfDataUri });
      setExtractedData(result);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to extract data. ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: "There was a problem processing your invoice. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Invoice</CardTitle>
          <CardDescription>Select a PDF invoice file (max 5MB) to extract its data.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full max-w-lg items-center gap-1.5">
              <Label htmlFor="invoice-pdf">PDF File</Label>
              <Input 
                id="invoice-pdf" 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange} 
                className="file:text-sm file:font-semibold file:text-primary file:bg-primary-foreground hover:file:bg-accent/10"
              />
            </div>
            {error && !file && (
              <Alert variant="destructive" className="max-w-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={isLoading || !file} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <FileUp className="mr-2 h-4 w-4" />
                  Extract Data
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {isLoading && <InvoiceDataSkeleton />}
      {extractedData && <InvoiceDataDisplay data={extractedData} />}
    </div>
  );
}
