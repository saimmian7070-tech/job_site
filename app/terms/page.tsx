export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">

        {/* Header */}
        <div className="mb-10 pb-8 border-b border-gray-200">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-3">
            Legal
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="mt-3 text-sm text-gray-500">
            Last updated: June 2025
          </p>
        </div>

        {/* Body */}
        <div className="space-y-8 text-sm leading-relaxed text-gray-600">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing or using Jobs Home Online, you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the website.
              Continued use of the site constitutes acceptance of any updates to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">2. Use of Content</h2>
            <p>
              Job listings, articles, and all other content on this website are provided for
              informational purposes only. Jobs Home Online does not guarantee the accuracy,
              completeness, or availability of any listing. Users should independently verify
              opportunities before applying or making any decisions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">3. Content Changes</h2>
            <p>
              We reserve the right to modify, update, or remove any content on the website
              at any time without prior notice. This includes job listings, articles, and
              these terms themselves.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">4. User Conduct</h2>
            <p>
              You agree not to misuse this website, including but not limited to: scraping
              content without permission, posting false or misleading information, or
              attempting to interfere with the website's operation.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">5. Third-Party Links</h2>
            <p>
              This website may contain links to external job listings or third-party websites.
              We are not responsible for the content, accuracy, or practices of those sites.
              Visiting them is at your own discretion.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">6. Disclaimer</h2>
            <p>
              Jobs Home Online is not a recruitment agency and does not act as an employer
              or agent on behalf of any company. We make no warranties, expressed or implied,
              regarding the suitability of any job listing for any particular purpose.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">7. Contact</h2>
            <p>
              If you have questions about these terms, please{" "}
              <a href="/contact" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">
                contact us
              </a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
}