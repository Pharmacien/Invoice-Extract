"use client";

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { extractInvoiceData, type ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { appendExtractedData } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Loader2, AlertCircle, FileText } from 'lucide-react';
import Link from 'next/link';

const toDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });

export function InvoiceExtractor() {
  const [files, setFiles] = useState<File[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const newFiles = Array.from(selectedFiles);
      let hasError = false;
      for (const file of newFiles) {
        if (file.type !== 'application/pdf') {
          setError("Please upload PDF files only.");
          toast({ variant: "destructive", title: "Invalid File Type", description: "Only PDF files are accepted." });
          hasError = true;
          break;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          setError("File size should not exceed 5MB.");
          toast({ variant: "destructive", title: "File Too Large", description: `File ${file.name} exceeds 5MB.` });
          hasError = true;
          break;
        }
      }

      if (hasError) {
        setFiles(null);
      } else {
        setFiles(newFiles);
        setError(null);
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!files || files.length === 0) {
      setError("Please select one or more files to upload.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await Promise.all(
        files.map(async (file) => {
          const pdfDataUri = await toDataURL(file);
          try {
            return await extractInvoiceData({ pdfDataUri });
          } catch (e) {
            console.error(`Error processing ${file.name}:`, e);
            // Return a partial result or null to indicate failure for this file
            return null;
          }
        })
      );
      
      const successfulResults = results.filter(result => result !== null) as ExtractInvoiceDataOutput[];
      
      if (successfulResults.length === 0) {
        throw new Error("No data could be extracted from the provided files.");
      }

      await appendExtractedData(successfulResults);

      if (successfulResults.length < files.length) {
         toast({
          variant: "destructive",
          title: "Partial Extraction",
          description: `Could not process all files. Extracted data from ${successfulResults.length} of ${files.length} files.`,
        });
      }

      router.push('/extracted-data');

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to extract data. ${errorMessage}`);
      toast({
        variant: "destructive",
        title: "Extraction Failed",
        description: "There was a problem processing your invoices. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Upload Invoices</CardTitle>
          <CardDescription>Select one or more PDF invoice files (max 5MB each) to extract data.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid w-full max-w-lg items-center gap-1.5">
              <Label htmlFor="invoice-pdf">PDF Files</Label>
              <Input
                id="invoice-pdf"
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileChange}
                className="file:text-sm file:font-semibold file:text-primary file:bg-primary-foreground hover:file:bg-accent/10"
              />
            </div>
            {error && (!files || files.length === 0) && (
              <Alert variant="destructive" className="max-w-lg">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" disabled={isLoading || !files || files.length === 0} className="bg-accent hover:bg-accent/90 text-accent-foreground">
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
        <CardFooter>
            <Button variant="outline" asChild>
                <Link href="/extracted-data">
                    <FileText className="mr-2 h-4 w-4" />
                    View All Extracted Data
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
