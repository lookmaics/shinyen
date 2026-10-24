import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shinyen (ꯁꯤꯟꯌꯦꯟ) | Indigenous Thrift & Handloom Drops",
  description: "Curated thrift streetwear, authentic handloom attire (Rani Phi, Moirang Phee), and handcrafted jewellery from Manipur artisans. Live drops & zero-counterfeit escrow.",
  manifest: "/manifest.json",
  applicationName: "Shinyen",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Shinyen",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#D92D20",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-safe selection:bg-red-100 selection:text-red-900">
        <main className="max-w-md mx-auto min-h-screen bg-white shadow-xl relative flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
