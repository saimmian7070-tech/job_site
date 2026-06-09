"use client";

import { useState } from "react";
import Link from "next/link";

type FormState = "idle" | "submitting" | "success";

export default function ContactPage() {
  const [state, setState] = useState<FormState>("idle");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setTimeout(() => {
      setState("success");
      setForm({ firstName: "", lastName: "", email: "", subject: "", message: "" });
    }, 1200);
  }

  return (
    <div className="bg-slate-50 min-h-screen">

      {/* Page header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 mb-2">
            Get in Touch
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Contact Us
          </h1>
          <p className="mt-3 text-slate-500 text-base max-w-xl leading-relaxed">
            Have a question, suggestion, or business inquiry? We'd love to hear from you.
            Reach out and we'll get back to you promptly.
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">

          {/* Contact cards */}
          <div className="md:col-span-1 space-y-4">

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <svg className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">Email Us</h3>
              </div>
              <p className="text-xs text-slate-500 mb-2 leading-relaxed">
                For general questions, partnerships, or feedback.
              </p>
              <a
                href="mailto:contact@jobshomeonline.com"
                className="text-sm font-semibold text-blue-700 hover:text-blue-800 transition-colors break-all"
              >
                contact@jobshomeonline.com
              </a>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <svg className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">Response Time</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                We aim to respond to all inquiries within
                <span className="font-semibold text-slate-700"> 48 business hours</span>.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <svg className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">Advertise With Us</h3>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Interested in advertising or posting a job? Reach out via email and we'll send you our media kit.
              </p>
            </div>

          </div>

          {/* Contact form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 p-7 md:p-9">

              {/* ── SUCCESS STATE ─────────────────────────────────────── */}
              {state === "success" ? (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full bg-green-50 border border-green-200 flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    Message Received!
                  </h2>
                  <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-2">
                    Thank you for reaching out. We've received your message and
                    will get back to you within <span className="font-semibold text-slate-700">48 business hours</span>.
                  </p>
                  <p className="text-xs text-slate-400 mb-8">
                    In the meantime, feel free to browse our latest job listings or career guides.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <Link
                      href="/jobs"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
                    >
                      Browse Jobs
                    </Link>
                    <button
                      onClick={() => setState("idle")}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Send Another Message
                    </button>
                  </div>
                </div>

              ) : (
                /* ── FORM STATE ───────────────────────────────────────── */
                <>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Send Us a Message</h2>
                  <p className="text-sm text-slate-500 mb-7">
                    Fill in the form below and we'll get back to you as soon as possible.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          required
                          placeholder="John"
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          required
                          placeholder="Doe"
                          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                        Subject
                      </label>
                      <select
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition appearance-none"
                      >
                        <option value="">Select a topic…</option>
                        <option value="general">General Inquiry</option>
                        <option value="jobs">Job Listing Question</option>
                        <option value="advertise">Advertising / Partnership</option>
                        <option value="editorial">Editorial / Content</option>
                        <option value="technical">Technical Issue</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Write your message here…"
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-1">
                      <p className="text-xs text-slate-400">
                        By submitting you agree to our{" "}
                        <Link href="/privacy" className="text-blue-700 hover:underline">
                          Privacy Policy
                        </Link>.
                      </p>
                      <button
                        type="submit"
                        disabled={state === "submitting"}
                        className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {state === "submitting" ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                            </svg>
                            Sending…
                          </>
                        ) : (
                          <>
                            Send Message
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}

            </div>
          </div>

        </div>

        {/* FAQ nudge */}
        <div className="mt-8 bg-white border border-slate-200 rounded-xl px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Looking for quick answers?</p>
            <p className="text-xs text-slate-500 mt-0.5">Check our FAQ page — most common questions are already answered there.</p>
          </div>
          <Link
            href="/faq"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
          >
            Visit FAQ
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

      </div>
    </div>
  );
}