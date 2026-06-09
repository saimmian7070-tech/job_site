import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 mb-3">
            About Us
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-snug">
            Jobs Home Online
          </h1>
          <p className="mt-4 text-base text-slate-500 leading-relaxed max-w-xl">
            A global career platform helping professionals find opportunities,
            grow their careers, and stay informed about the modern job market.
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-12">

        {/* Mission */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700 mb-4">
            Our Mission
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 p-7 space-y-4">
            <p className="text-slate-700 leading-relaxed text-[15px]">
              Jobs Home Online was built around a simple idea: finding a job or growing a career
              shouldn't be complicated. We bring together curated job listings, honest career advice,
              and hiring insights — all in one place, free for every job seeker.
            </p>
            <p className="text-slate-500 leading-relaxed text-[15px]">
              Whether you're searching for your first role, switching industries, or looking for
              fully remote work, we're here to help you move forward with confidence.
            </p>
          </div>
        </section>

        {/* What we offer */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700 mb-4">
            What We Offer
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {[
              { icon: "💼", title: "Job Listings",     body: "Curated remote, hybrid, and full-time roles across tech, marketing, design, finance, and more — updated daily." },
              { icon: "📰", title: "Career Articles",  body: "In-depth guides on resumes, interviews, salary negotiation, career changes, and workplace trends." },
              { icon: "🎯", title: "Hiring Insights",  body: "Practical perspective on what employers look for and how to stay ahead in a competitive job market." },
              { icon: "🌐", title: "Remote Resources", body: "Dedicated content and listings for professionals seeking location-independent opportunities globally." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 px-6 py-5">
                <span className="text-xl mt-0.5 shrink-0">{item.icon}</span>
                <div>
                  <p className="font-semibold text-slate-900 text-sm mb-1">{item.title}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700 mb-4">
            Our Values
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {[
              { title: "Free for Job Seekers",   body: "Browsing jobs and accessing career resources will never cost anything. That's a commitment." },
              { title: "Accessible to Everyone", body: "We believe quality career guidance should be available regardless of location or background." },
              { title: "Honest Content",         body: "Our articles are written to give real, actionable advice — not generic filler." },
              { title: "Global by Design",       body: "From remote startups to global enterprises, we surface roles and insights from around the world." },
            ].map((v) => (
              <div key={v.title} className="px-6 py-5">
                <p className="font-semibold text-slate-900 text-sm mb-1">{v.title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-700 rounded-xl p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="font-bold text-white text-base mb-1">Ready to find your next role?</p>
            <p className="text-sm text-blue-200">Browse curated listings — updated daily, always free.</p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50 transition-colors"
            >
              Browse Jobs
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}