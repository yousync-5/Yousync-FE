import MovieDetailModal from "@/components/MovieDetailModal";
import { NavBar } from "@/components/NavBar";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  //nav바
  return (
    <>
    <NavBar />
    <MovieDetailModal />
    <Component {...pageProps} />
    </>
  );
}
