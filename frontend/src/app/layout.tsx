import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Haze Removal Demo — U-Net Image Dehazing",
  description:
    "Upload a hazy image and see it dehazed in real-time using a U-Net deep learning model.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white antialiased">
        {children}
      </body>
    </html>
  );
}
