import type { Metadata } from "next";
import { Outfit, Doto } from "next/font/google";
import "./globals.css";
import { ThemeModeScript } from "flowbite-react";
import ProgressWrapper from "../components/ProgressWrapper";
import { SessionProvider } from "next-auth/react";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const doto = Doto({
  variable: "--font-doto",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blog Next",
  description: "Next generation blogging platform, express your thoughts using AI assistant.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${doto.variable}`}>
      <head>
        <ThemeModeScript />
      </head>
      <body className="dark:bg-gray-900">
        <ProgressWrapper>
          <SessionProvider>
            <div id="main-wrapper">
              {children}
            </div>
          </SessionProvider>
        </ProgressWrapper>
      </body>
    </html>
  );
}
