import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "ReelsMaxx",
  description: "Professional video review and captioning dashboard for short-form content",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
