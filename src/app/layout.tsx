import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blog Next",
  description: "Next generation blogging platform, express your thoughts using AI assistant.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div id="main-wrapper" className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <Nav />
          <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
            <header><h1>Blogify your self</h1></header>
            <article> {children} </article>
            <aside>Sidebar goes here</aside>
          </main>


          <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
            <h4>Footer goes here..</h4>
          </footer>
        </div>
      </body>
    </html>
  );
}
