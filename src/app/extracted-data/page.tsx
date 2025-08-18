'use client';

import { useEffect, useState } from 'react';
import { InvoiceDataDisplay } from '@/components/invoice-data-display';
import { InvoiceDataSkeleton } from '@/components/invoice-data-skeleton';
import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { getExtractedData, deleteInvoice, deleteInvoicesByProvider, deleteAllData } from '@/app/actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Trash2, View } from 'lucide-react';
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

export default function ExtractedDataPage() {
  const [data, setData] = useState<ExtractInvoiceDataOutput[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const extractedData = await getExtractedData();
      setData(extractedData);
    } catch (error) {
      console.error('Failed to load extracted data:', error);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAction = async (action: () => Promise<void>, successMessage: string) => {
    try {
      await action();
      await loadData();
      toast({
        title: "Success",
        description: successMessage,
      });
    } catch (error) {
      console.error('Action failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred.',
      });
    }
  };
  
  const handleDeleteInvoice = async (invoiceNumber: string, invoiceDate: string) => {
    await handleAction(
      () => deleteInvoice(invoiceNumber, invoiceDate),
      "Invoice has been deleted successfully."
    );
  };
  
  const handleDeleteByProvider = async (providerName: string) => {
    await handleAction(
      () => deleteInvoicesByProvider(providerName),
      `All invoices for ${providerName} have been deleted.`
    );
  };
  
  const handleDeleteAll = async () => {
    await handleAction(
      () => deleteAllData(),
      "All extracted data has been deleted."
    );
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
           <Button variant="outline" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Upload
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/all-invoices">
                <View className="mr-2 h-4 w-4" />
                View All (Sorted by Date)
              </Link>
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" disabled={!data || data.length === 0}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all extracted invoice data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAll}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
          </div>
        </div>
        
        {isLoading && <InvoiceDataSkeleton />}
        {!isLoading && data && (
          <InvoiceDataDisplay 
            data={data} 
            onDeleteInvoice={handleDeleteInvoice}
            onDeleteProvider={handleDeleteByProvider}
          />
        )}
      </div>
    </main>
  );
}
