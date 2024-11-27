import "@/styles/globals.css";
import type { AppProps } from "next/app";
import 'monaco-editor/min/vs/editor/editor.main.css';

export default function App({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
