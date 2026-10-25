import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Lookmai Rider | Fleet Dispatch",
  description: "Dedicated fleet delivery, navigation, and OTP verification app for Lookmai riders.",
  manifest: "/manifest-rider.json",
  applicationName: "Lookmai Rider",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Lookmai Rider",
  },
  icons: {
    icon: "/icons/rider-192.png",
    apple: "/icons/rider-192.png",
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

export default function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
