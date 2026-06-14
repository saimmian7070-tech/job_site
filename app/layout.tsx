import "./globals.css";
import Link from "next/link";
import NavLinks from "./components/NavLinks";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://jobshomeonline.com"),
  title: {
    default: "Jobs Home Online – Find Your Next Career Move",
    template: "%s | Jobs Home Online",
  },
  description:
    "Discover remote jobs, career opportunities, and expert hiring insights from companies around the world.",
  keywords: "jobs, remote jobs, IT jobs, careers, hiring, career advice",
  authors: [{ name: "Jobs Home Online" }],
  creator: "Jobs Home Online",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jobshomeonline.com",
    siteName: "Jobs Home Online",
    title: "Jobs Home Online – Find Your Next Career Move",
    description:
      "Discover remote jobs, career opportunities, and expert hiring insights from companies around the world.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Jobs Home Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jobs Home Online – Find Your Next Career Move",
    description:
      "Discover remote jobs, career opportunities, and expert hiring insights from companies around the world.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_CODE", // replace before launch
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased overflow-x-hidden">

        {/* ── NAVBAR ──────────────────────────────────────────────────────── */}
        <nav aria-label="Main navigation" className="fixed top-0 left-0 right-0 z-[99999] bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 min-w-0 overflow-hidden">

            {/* Logo */}
            <Link href="/" aria-label="Jobs Home Online – Home" className="flex items-center gap-2.5 shrink-0">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 shadow-sm shrink-0">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="5" width="14" height="10" rx="2" stroke="white" strokeWidth="1.6"/>
                <path d="M6 5V4a3 3 0 016 0v1" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                <path d="M2 9h14" stroke="white" strokeWidth="1.4" strokeOpacity="0.5"/>
              </svg>
            </span>
            <span className="text-[15px] font-bold tracking-tight text-slate-900 leading-none">
            Jobs<span className="text-blue-700">Home</span> Online
          </span>
              
            </Link>

            {/* Nav links + CTA */}
            <div className="flex items-center gap-1 sm:gap-2">
              <NavLinks />
              <Link
                href="/blog"
                className="hidden sm:inline-flex ml-1 inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-600 active:bg-blue-800 transition-colors whitespace-nowrap shadow-sm sm:px-4 sm:text-sm sm:ml-2"
              >
                Career Tips
              </Link>
            </div>

          </div>
        </nav>

        {/* ── PAGE CONTENT ────────────────────────────────────────────────── */}
        <main className="pt-16">{children}</main>

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        {/*
          NOTE: This is the single source-of-truth footer for the entire site.
          Do NOT add a footer inside individual page files (e.g. page.tsx).
          Any page-level footer will render twice.
        */}
        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 border-b border-slate-800 pb-12">

              {/* Brand */}
              <div className="col-span-2 md:col-span-1">
                <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shrink-0">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="5" width="14" height="10" rx="2" stroke="white" strokeWidth="1.6"/>
                    <path d="M6 5V4a3 3 0 016 0v1" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
                    <path d="M2 9h14" stroke="white" strokeWidth="1.4" strokeOpacity="0.5"/>
                  </svg>
                </span>
                <span className="text-[15px] font-bold text-white tracking-tight leading-none">
                  Jobs<span className="text-blue-400">Home</span> Online
                </span>
                </Link>
                <p className="text-sm text-slate-500 leading-relaxed max-w-[220px]">
                  Curated job listings and career guides for professionals at every level.
                </p>
                {/* Trust signals */}
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/8 text-[11px] text-slate-400 font-medium">
                    <svg className="w-3 h-3 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Free to use
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/8 text-[11px] text-slate-400 font-medium">
                    <svg className="w-3 h-3 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Updated daily
                  </span>
                </div>
              </div>

              {/* Jobs */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white mb-4">
                  Jobs
                </h4>
                <ul className="space-y-3">
                  {[
                    { label: "Browse Jobs",  href: "/jobs" },
                    { label: "Remote Jobs",  href: "/jobs?type=remote" },
                    { label: "Part-Time",    href: "/jobs?type=part-time" },
                    { label: "Full-Time",    href: "/jobs?type=full-time" },
                    { label: "Entry Level",  href: "/jobs?level=entry" },
                    { label: "Categories",   href: "/categories" },
                  ].map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-slate-500 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white mb-4">
                  Career Advice
                </h4>
                <ul className="space-y-3">
                  {[
                    { label: "All Articles",    href: "/blog" },
                    { label: "Resume Writing",  href: "/blog?topic=resume" },
                    { label: "Interview Prep",  href: "/blog?topic=interview" },
                    { label: "Salary Guide",    href: "/blog?topic=salary" },
                    { label: "Work From Home",  href: "/blog?topic=remote" },
                    { label: "FAQ",             href: "/faq" },
                  ].map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-slate-500 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white mb-4">
                  Company
                </h4>
                <ul className="space-y-3">
                  {[
                    { label: "About Us",         href: "/about" },
                    { label: "Contact",          href: "/contact" },
                    { label: "Advertise",        href: "/advertise" },
                    { label: "Privacy Policy",   href: "/privacy" },
                    { label: "Terms of Service", href: "/terms" },
                    { label: "Sitemap",          href: "/sitemap.xml" },
                  ].map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-slate-500 hover:text-white transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Bottom bar */}
            <div className="pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-slate-600">
              <p>© {new Date().getFullYear()} Jobs Home Online. All rights reserved.</p>
              <div className="flex items-center gap-5">
                <Link href="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
                <Link href="/terms"   className="hover:text-slate-400 transition-colors">Terms</Link>
                <Link href="/contact" className="hover:text-slate-400 transition-colors">Contact</Link>
              </div>
            </div>

          </div>
        </footer>

      </body>
    </html>
  );
}