import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { NavBar } from "@/components/ui/NavBar";
import Footer from "@/components/ui/Footer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-neutral-950">
        <NavBar />
        <main className="flex-1 pb-[60px] overflow-y-auto">
          <Component {...pageProps} />
        </main>
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <Footer />
        </div>
      </div>
    </QueryClientProvider>
  );
}