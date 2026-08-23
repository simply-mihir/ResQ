import type { Metadata } from "next";
import { Lobster } from 'next/font/google';
import "./globals.css";

const lobster = Lobster({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-lobster',
});

export const metadata: Metadata = {
  title: "ResQ — Next-Gen Emergency Intelligence",
  description: "Seamlessly connecting patients, hospitals, and dispatchers in real-time.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lobster.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
