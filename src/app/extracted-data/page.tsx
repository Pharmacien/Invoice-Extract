'use client';

import { useEffect, useState } from 'react';
import { InvoiceDataDisplay } from '@/components/invoice-data-display';
import { InvoiceDataSkeleton } from '@/components/invoice-data-skeleton';
import type { ExtractInvoiceDataOutput } from '@/ai/flows/extract-invoice-data';
import { getExtractedData } from '@/app/actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ExtractedDataPage() {
  const [data, setData] = useState<ExtractInvoiceDataOutput[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
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
    }
    loadData();
  }, []);

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
        </div>
        
        {isLoading && <InvoiceDataSkeleton />}
        {!isLoading && data && <InvoiceDataDisplay data={data} />}
      </div>
    </main>
  );
}
