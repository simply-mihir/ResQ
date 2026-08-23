import type { Metadata } from "next";
import { Raleway } from 'next/font/google';
import "./globals.css";

const raleway = Raleway({ 
  subsets: ['latin'],
  variable: '--font-raleway',
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
      <body className={`${raleway.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
