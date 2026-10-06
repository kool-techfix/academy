import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kool TechFix ITAcad",
  description: "Practical IT learning, built for the real world",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <QueryProvider>
        <body className="min-h-full flex flex-col">
          {children}
          {/* App is light-only; styled with brand tokens in globals.css. */}
          <Toaster
            theme="light"
            position="top-right"
            toastOptions={{ classNames: { toast: "app-toast" } }}
          />
        </body>
      </QueryProvider>
    </html>
  );
}
