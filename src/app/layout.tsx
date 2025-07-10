import type { Metadata } from "next";
import { headers } from "next/headers";
import { Outfit, Doto } from "next/font/google";
import "./globals.css";
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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  const authRegex = /^\/(signin|signup)$/i;
  const headerList = await headers();
  const isAuthPage = authRegex.test(headerList.get("x-request-path") || "");

  return (
    <html lang="en" className={`${outfit.variable} ${doto.variable}`}>
      <body className={`font-outfit bg-background`}>
        <div id="main-wrapper">
          {isAuthPage ? (
            <main>
              <article> {children} </article>
            </main>
          ) : (
            <>
              <Topbar />
              <main className="mt-17">
                <header><h1>Blogify your self</h1></header>
                <article> {children} </article>
                <aside>Sidebar goes here</aside>
              </main>
              <footer className="bg-gray-200">
                <h4>Footer goes here..</h4>
              </footer>
            </>
          )}
        </div>
      </body>
    </html>
  );
}
