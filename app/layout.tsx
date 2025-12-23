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
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      {/* 🟢 UPDATED LINE BELOW: Adds rich dark background & adjusts text color */}
      <body className="bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}