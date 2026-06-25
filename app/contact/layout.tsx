import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Jobs Home Online",
  description: "Get in touch with the Jobs Home Online team. We respond to all inquiries within 48 business hours.",
  alternates: {
    canonical: "https://jobshomeonline.com/contact",
  },
  openGraph: {
    title: "Contact Us | Jobs Home Online",
    description: "Get in touch with the Jobs Home Online team.",
    url: "https://jobshomeonline.com/contact",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}