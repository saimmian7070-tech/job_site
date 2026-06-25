import Link from "next/link";
export const metadata = {
  title: "Companies Hiring | Jobs Home Online",
  description: "Explore industries and company types actively hiring on Jobs Home Online.",
  alternates: {
    canonical: "https://jobshomeonline.com/companies",
  },
  openGraph: {
    title: "Companies Hiring | Jobs Home Online",
    description: "Explore industries and company types actively hiring on Jobs Home Online.",
    url: "https://jobshomeonline.com/companies",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};

const INDUSTRIES = [
  { icon: "💻", label: "Tech & Engineering",  href: "/categories/tech",        description: "Software firms, SaaS companies, and engineering teams hiring globally." },
  { icon: "📣", label: "Marketing & Growth",  href: "/categories/marketing",   description: "Agencies, in-house teams, and startups looking for marketers and content creators." },
  { icon: "🎨", label: "Design & Creative",   href: "/categories/design",      description: "Product studios, agencies, and brands hiring designers at every level." },
  { icon: "📊", label: "Finance & Accounting",href: "/categories/finance",     description: "Banks, fintechs, and enterprises with open finance and accounting roles." },
  { icon: "🤝", label: "Customer Support",    href: "/categories/support",     description: "Remote-first companies building global support and success teams." },
  { icon: "🌍", label: "Remote-First",        href: "/categories/remote",      description: "Companies that hire fully distributed talent across time zones." },
] as const;

const TRUST_POINTS = [
  { icon: "📋", title: "Curated Listings",    body: "Every job is reviewed before going live — no spam, no expired roles." },
  { icon: "🔄", title: "Updated Daily",       body: "New opportunities added every day across all industries and regions." },
  { icon: "🌐", title: "Global Reach",        body: "Listings from companies across North America, Europe, Asia, and beyond." },
  { icon: "🆓", title: "Always Free",         body: "Job seekers never pay. Browse and apply at no cost, ever." },
] as const;

export default function CompaniesPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="py-12 md:py-16 border-b border-gray-200">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
            Who's Hiring
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight max-w-xl">
            Roles from companies hiring right now.
          </h1>
          <p className="mt-4 text-gray-500 text-sm max-w-xl leading-relaxed">
            Jobs Home Online aggregates listings from companies across every
            major industry — from early-stage startups to global enterprises.
            New roles land daily.
          </p>
        </div>

        {/* Industry tiles */}
        <div className="py-10">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Industries Represented</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INDUSTRIES.map((item) => (
                <Link
                  href={item.href}
                  key={item.label}
                className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 hover:border-blue-300 transition-all"
              >
                <span className="text-2xl">{item.icon}</span>
                <h3 className="font-semibold text-gray-900 text-sm">{item.label}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Trust strip */}
        <div className="py-10 border-t border-gray-200">
          <h2 className="text-base font-semibold text-gray-900 mb-6">Why job seekers trust us</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST_POINTS.map((item) => (
              <div key={item.title} className="flex flex-col gap-2">
                <span className="text-xl">{item.icon}</span>
                <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="py-10 border-t border-gray-200">
          <div className="bg-white border border-gray-200 rounded-xl p-7 md:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Ready to find your next role?</h2>
              <p className="text-sm text-gray-500 mt-1">
                Browse all open positions — updated daily across every industry.
              </p>
            </div>
            <Link
              href="/jobs"
              className="shrink-0 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-semibold text-sm rounded-lg px-6 py-3"
            >
              Browse All Jobs
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}