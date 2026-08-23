import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
