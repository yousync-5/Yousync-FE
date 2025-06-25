import Modal from "@/components/MovieDetailModal";
import { NavBar } from "@/components/NavBar";
import type { AppProps } from "next/app";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  //nav바
  return (
    <>
    <Modal />
    <NavBar />
    <Component {...pageProps} />
    </>
  );
}
