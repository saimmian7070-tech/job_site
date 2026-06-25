"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("Something went wrong. Try again."); // ✅ FIX 7

  const handleSubmit = async () => {
    if (!email) return;

    // ✅ FIX 7: Client-side email validation with specific message
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setErrorMessage("Something went wrong. Try again.");
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch {
      setErrorMessage("Something went wrong. Try again.");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="text-center">
      <div className="flex justify-center gap-3 flex-wrap">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()} // ✅ FIX 5: Enter key support
          placeholder="Enter your email"
          aria-label="Email address for newsletter"  // ✅ FIX 6: Accessibility label
          autoComplete="email"                        // ✅ FIX 6: Autocomplete hint
          className="border border-white/30 bg-white/10 text-white placeholder-blue-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 min-w-[220px]"
        />
        <button
          onClick={handleSubmit}
          disabled={status === "loading"}
          className="bg-white text-blue-700 font-bold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-60"
        >
          {status === "loading" ? "Subscribing..." : "Subscribe"}
        </button>
      </div>

      {/* ✅ FIX 6: role="status" + aria-live so screen readers announce result */}
      <div className="h-6 mt-4 flex justify-center" role="status" aria-live="polite">
        {status === "success" && (
          <p className="text-green-300 font-medium">Thanks for subscribing! ✅</p>
        )}
        {status === "error" && (
          <p className="text-red-300 font-medium">{errorMessage}</p>
        )}
      </div>
    </div>
  );
}