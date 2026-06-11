import localFont from "next/font/local";
import { cn } from "@/lib/utils";

const fontMontserrat = localFont({
  src: "../public/fonts/Montserrat-VariableFont_wght.ttf",
  variable: "--font-heading",
  display: "swap",
});

const fontGeistSans = localFont({
  src: "../public/fonts/Geist-VariableFont_wght.ttf",
  variable: "--font-sans",
  display: "swap",
});

const fontGeistMono = localFont({
  src: "../public/fonts/GeistMono-VariableFont_wght.ttf",
  variable: "--font-mono",
  display: "swap",
});

export const fontVariables = cn(
  fontMontserrat.variable,
  fontGeistSans.variable,
  fontGeistMono.variable,
);
