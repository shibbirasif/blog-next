import type { Metadata } from "next";
import { Outfit, Doto } from "next/font/google";
import "./globals.css";
import Nav from "@/components/nav";
import Topbar from "@/components/Topbar";

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" className={`${outfit.variable} ${doto.variable}`}>
      <body className={`font-outfit bg-background`}>
        <div id="main-wrapper">
          <Topbar />
          <h1>a</h1>
          <main>
            <header><h1>Blogify your self</h1></header>
            <article> {children} </article>
            <aside>Sidebar goes here</aside>
          </main>


          <footer className="bg-gray-200">
            <h4>Footer goes here..</h4>
          </footer>
        </div>
      </body>
    </html>
  );
}
