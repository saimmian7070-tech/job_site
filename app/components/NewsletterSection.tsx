import Newsletter from "./Newsletter";

export default function NewsletterSection() {
  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-8 py-12 sm:px-12 sm:py-16 text-center shadow-xl">
      
      {/* Background texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Glow blob */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, #a5b4fc 0%, transparent 70%)" }}
      />

      <div className="relative">
        {/* Eyebrow */}
        <span className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold uppercase tracking-widest text-blue-100">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse" />
          Free · No Spam · Unsubscribe Anytime
        </span>

        <h2 id="newsletter" className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Stay ahead of the job market
        </h2>

        <p className="text-blue-200 mt-3 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
          Career tips, hiring trends, and fresh opportunities — straight to your inbox every week.
        </p>

        <div className="mt-8">
          <Newsletter />
        </div>
      </div>
    </div>
  );
}