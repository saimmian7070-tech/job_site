"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = () => {
    if (!email) return;

    setSuccess(true);
    setEmail("");

    setTimeout(() => {
      setSuccess(false);
    }, 3000);
  };

  return (
    <div className="text-center">
      <div className="flex justify-center gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="border px-4 py-3 rounded-lg"
        />

        <button
          onClick={handleSubmit}
          className="bg-black text-white px-6 py-3 rounded-lg"
        >
          Subscribe
        </button>
      </div>

      <div className="h-6 mt-4 flex justify-center">
  <p
    className={`text-green-600 font-medium transition-opacity duration-300 ${
      success ? "opacity-100" : "opacity-0"
    }`}
  >
    Thanks for subscribing!
  </p>
</div>
    </div>
  );
}