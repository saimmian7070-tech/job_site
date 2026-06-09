import Newsletter from "./Newsletter";

export default function NewsletterSection() {
  return (
    <div className="max-w-3xl mx-auto text-center">

      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
        Stay Updated
      </h2>

      <p className="text-gray-600 mt-3 text-sm sm:text-base">
        Get career tips, industry insights, and new opportunities delivered to your inbox.
      </p>

      <div className="mt-6">
        <Newsletter />
      </div>

    </div>
  );
}