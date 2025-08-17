import { InvoiceExtractor } from '@/components/invoice-extractor';

export default function Home() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-8">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary">
            InvoiceXtract
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Extract data from Slovenian PDF invoices with the power of AI.
          </p>
        </header>
        <InvoiceExtractor />
      </div>
    </main>
  );
}
