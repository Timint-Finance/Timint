import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TiMint Finance | Digital Startup Registry for Teens",
  description: "Register your startup name with guardian approval. Get blockchain-secured ownership proof, verification badge, and official certificate. Trusted by young entrepreneurs.",
  keywords: "teen startup, business registration, digital ownership, blockchain, parent approval, KYC, startup name",
  authors: [{ name: "TiMint Finance" }],
  openGraph: {
    title: "TiMint Finance | Digital Startup Registry for Teens",
    description: "Register your startup name with guardian approval and blockchain security.",
    type: "website",
  },
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
