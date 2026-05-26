import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import ToasterProvider from "@/components/ToasterProvider";
import { MapPin, Phone, Star, Clock } from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A to Z Distributors",
  description: "B2B Wholesale Produce Ordering Platform",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "A to Z Distributors",
  },
};

export const viewport = {
  themeColor: "#059669",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 font-sans">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <ToasterProvider position="bottom-right" />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          
          <footer className="bg-gray-900 text-gray-300 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xl leading-none">A</span>
                  </div>
                  <span className="font-bold text-xl tracking-tight text-white">
                    A to Z Distributors Fruit and Veg
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin size={18} className="mt-0.5 text-emerald-500 flex-shrink-0" />
                  <p>104 Barkly Rd, West End,<br />Kimberley, 8301,<br />South Africa</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone size={18} className="text-emerald-500 flex-shrink-0" />
                  <p>+27 82 820 0549</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Operating Hours</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-400">Mon - Thu</span>
                    <span>7:00 AM - 6:00 PM</span>
                  </li>
                  <li className="flex justify-between border-t border-gray-800 pt-2">
                    <span className="text-gray-400">Fri</span>
                    <span className="text-right">7:00 AM - 12:00 PM<br/>2:00 PM - 6:00 PM</span>
                  </li>
                  <li className="flex justify-between border-t border-gray-800 pt-2">
                    <span className="text-gray-400">Sat</span>
                    <span>7:00 AM - 4:00 PM</span>
                  </li>
                  <li className="flex justify-between border-t border-gray-800 pt-2">
                    <span className="text-gray-400">Sun</span>
                    <span>7:00 AM - 12:00 PM</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Customer Reviews</h3>
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                  <div className="flex items-center gap-1 text-emerald-400 mb-2">
                    <Star fill="currentColor" size={16} />
                    <Star fill="currentColor" size={16} />
                    <Star fill="currentColor" size={16} />
                    <Star fill="currentColor" size={16} />
                    <Star fill="currentColor" size={16} className="opacity-50" />
                    <span className="text-white font-medium ml-2">4.7 Stars</span>
                  </div>
                  <p className="text-sm italic text-gray-400">
                    "Fresh fruit & vegetables. Friendly professional service."
                  </p>
                </div>
              </div>

            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-center text-gray-500">
              © {new Date().getFullYear()} A to Z Distributors Fruit and Veg. All rights reserved. MVP Demo by Boraine Tech.
            </div>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
