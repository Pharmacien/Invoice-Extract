'use client';

import { useEffect, useState } from 'react';
import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { getExtractedData } from '@/app/actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AllInvoicesDisplay } from '@/components/all-invoices-display';
import { InvoiceDataSkeleton } from '@/components/invoice-data-skeleton';

export default function AllInvoicesPage() {
  const [data, setData] = useState<ExtractInvoiceDataOutput[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const extractedData = await getExtractedData();
      const sortedData = extractedData.sort((a, b) => {
        try {
            const dateA = new Date(a.invoiceDate.split('.').reverse().join('-')).getTime();
            const dateB = new Date(b.invoiceDate.split('.').reverse().join('-')).getTime();
            if (isNaN(dateA) || isNaN(dateB)) return 0;
            return dateB - dateA;
        } catch (e) {
            return 0;
        }
      });
      setData(sortedData);
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

  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-7xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            All Extracted Invoices
          </h1>
          <Button variant="outline" asChild>
            <Link href="/extracted-data">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Grouped View
            </Link>
          </Button>
        </div>
        
        {isLoading && <InvoiceDataSkeleton />}
        {!isLoading && data && (
          <AllInvoicesDisplay data={data} />
        )}
      </div>
    </main>
  );
}
