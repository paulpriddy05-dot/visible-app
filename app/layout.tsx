import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Visible",
  description: "The missing home screen for your Google Drive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* 🟢 THIS LINK RESTORES YOUR ICONS */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}