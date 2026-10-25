import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Shinyen Seller | Boutique Workstation",
  description: "60s Drop Lister and MSME Boutique Workstation for Manipur artisans and boutiques.",
  manifest: "/manifest-seller.json",
  applicationName: "Shinyen Seller",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Shinyen Seller",
  },
  icons: {
    icon: "/icons/seller-192.png",
    apple: "/icons/seller-192.png",
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

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
