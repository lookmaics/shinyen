import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Lookmai Control Hub | Founder Admin",
  description: "Founder & Operations Control Hub for Lookmai Escrow, Disputes, and Fleet Management.",
  manifest: "/manifest-admin.json",
  applicationName: "Lookmai Admin",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lookmai Admin",
  },
  icons: {
    icon: "/icons/admin-192.png",
    apple: "/icons/admin-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
