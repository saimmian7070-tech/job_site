import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Jobs Home Online",
  description: "Find answers to common questions about job listings, career advice, employers, and using Jobs Home Online.",
  alternates: {
    canonical: "https://jobshomeonline.com/faq",
  },
  openGraph: {
    title: "FAQ | Jobs Home Online",
    description: "Find answers to common questions about job listings, career advice, and using Jobs Home Online.",
    url: "https://jobshomeonline.com/faq",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};
const faqs = [
  {
    category: "Job Seekers",
    items: [
      {
        q: "Are the jobs listed on this website free to apply for?",
        a: "Yes, completely free. Job seekers can browse and apply to any opportunity through the application links provided in each listing. We never charge candidates to apply.",
      },
      {
        q: "Do you guarantee job availability?",
        a: "No. Job openings may change, expire, or be filled by employers at any time. We do our best to keep listings current, but we recommend verifying all details directly with the employer before applying.",
      },
      {
        q: "How often are job listings updated?",
        a: "Our listings and career resources are updated regularly — typically on a daily basis. New roles are added as they become available from employers worldwide.",
      },
    ],
  },
  {
    category: "Employers",
    items: [
      {
        q: "Can employers submit job listings?",
        a: "Yes. Employers and recruiters interested in listing open roles can reach out via our Contact page. We'll share details on how to get your positions in front of qualified candidates.",
      },
      {
        q: "Is there a cost to post a job?",
        a: "Posting options vary. Please contact us through the Contact page for current pricing and package information.",
      },
    ],
  },
  {
    category: "Career Advice",
    items: [
      {
        q: "Do you provide career advice?",
        a: "Yes. Our blog publishes articles covering resumes, interview preparation, salary negotiation, remote work, career change strategies, and hiring trends — all written to give real, actionable guidance.",
      },
      {
        q: "Can I suggest a topic for your blog?",
        a: "Absolutely. If there's a career topic you'd like us to cover, send us a message through the Contact page and we'll consider it for an upcoming article.",
      },
    ],
  },
  {
    category: "General",
    items: [
      {
        q: "How do I contact your team?",
        a: "You can reach us via our Contact page or email us directly at contact@jobshomeonline.com. We aim to respond to all inquiries within 48 business hours.",
      },
      {
        q: "How can I advertise on Jobs Home Online?",
        a: "We offer advertising placements for brands and services relevant to job seekers and professionals. Contact us through the Contact page or email us to request our media kit.",
      },
    ],
  },
];

export default function FAQPage() {
  const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.flatMap((section) =>
    section.items.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    }))
  ),
};
  return (
    <div className="bg-slate-50 min-h-screen">
          <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />

      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 mb-2">
            Help Center
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 text-slate-500 text-base max-w-xl leading-relaxed">
            Quick answers to the most common questions about jobs, career advice, employers, and using our platform.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[220px_1fr] gap-10">

          {/* Sticky category nav — desktop */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 bg-white rounded-xl border border-slate-200 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-3 px-2">
                Categories
              </p>
              <nav className="space-y-0.5">
                {faqs.map((section) => (
                  <a
                    key={section.category}
                    href={`#${section.category.toLowerCase().replace(/\s+/g, "-")}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                  >
                    {section.category}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* FAQ sections */}
          <div className="space-y-10">
            {faqs.map((section) => (
              <section
                key={section.category}
                id={section.category.toLowerCase().replace(/\s+/g, "-")}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                    {section.category}
                  </span>
                  <span className="flex-1 h-px bg-slate-200" />
                </div>

                <div className="space-y-3">
                  {section.items.map((faq, i) => (
                    <details
                      key={i}
                      className="group bg-white border border-slate-200 rounded-xl overflow-hidden"
                    >
                      <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none select-none hover:bg-slate-50 transition-colors">
                        <span className="text-sm font-semibold text-slate-900 leading-snug">
                          {faq.q}
                        </span>
                        <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-slate-50 group-open:bg-blue-50 group-open:border-blue-200 transition-colors">
                          <svg
                            className="h-3.5 w-3.5 text-slate-400 group-open:text-blue-600 group-open:rotate-45 transition-all"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </span>
                      </summary>
                      <div className="px-6 pb-5 pt-0">
                        <div className="h-px bg-slate-100 mb-4" />
                        <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}

            {/* Still need help */}
            <div className="bg-white border border-slate-200 rounded-xl p-7 flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                <svg className="h-5 w-5 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm">Still have a question?</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Can't find what you're looking for? Send us a message and we'll get back to you within 48 business hours.
                </p>
              </div>
              <Link
                href="/contact"
                className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
              >
                Contact Us
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}