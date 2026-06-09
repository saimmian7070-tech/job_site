export default function PrivacyPolicyPage() {
  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 mb-3">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">

          <div className="px-7 py-6">
            <h2 className="font-semibold text-slate-900 text-sm mb-2">Overview</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Jobs Home Online is committed to protecting your privacy. This policy explains how we collect,
              use, and safeguard information when you visit our website. By using this site, you agree to the
              practices described here.
            </p>
          </div>

          <div className="px-7 py-6">
            <h2 className="font-semibold text-slate-900 text-sm mb-2">Information We Collect</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              We may collect basic usage data such as pages visited, time on site, and browser type through
              analytics tools. If you subscribe to our newsletter or submit a contact form, we collect the
              email address and name you provide.
            </p>
          </div>

          <div className="px-7 py-6">
            <h2 className="font-semibold text-slate-900 text-sm mb-2">Cookies &amp; Advertising</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              This site uses cookies to improve user experience and measure performance. We may display
              third-party advertisements through services such as Google AdSense, which use cookies to
              serve relevant ads based on your browsing activity. You can opt out of personalised advertising
              via your browser settings or{" "}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                Google's Ad Settings
              </a>.
            </p>
          </div>

          <div className="px-7 py-6">
            <h2 className="font-semibold text-slate-900 text-sm mb-2">How We Use Your Information</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Data collected is used solely to operate and improve this website, send newsletters you have
              opted into, and respond to enquiries. We do not sell or share personal information with
              third parties for marketing purposes.
            </p>
          </div>

          <div className="px-7 py-6">
            <h2 className="font-semibold text-slate-900 text-sm mb-2">Third-Party Links</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Job listings on this site link to external employer websites. We are not responsible for the
              privacy practices or content of those third-party sites.
            </p>
          </div>

          <div className="px-7 py-6">
            <h2 className="font-semibold text-slate-900 text-sm mb-2">Your Rights</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              You may request access to, correction of, or deletion of any personal data we hold about you
              by contacting us at{" "}
              <a href="mailto:contact@jobshomeonline.com" className="text-blue-700 hover:underline">
                contact@jobshomeonline.com
              </a>.
            </p>
          </div>

          <div className="px-7 py-6">
            <h2 className="font-semibold text-slate-900 text-sm mb-2">Policy Updates</h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              We may update this policy from time to time. Continued use of the site after any changes
              constitutes acceptance of the revised policy.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}