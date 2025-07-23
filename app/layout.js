
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Prodbuilds",
  description: "Providing digital sultions to Web & Mobile Apps",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="body">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
