import type { AppProps } from "next/app";
import "@/styles/globals.css";
import Footer from "@/components/ui/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-neutral-950">
        <main className="flex-1 overflow-y-auto">
          <Component {...pageProps} />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}