"use client";

import { useState } from "react";

interface Props {
  jobId: string;
  title: string;
}

export default function BookmarkButton({ jobId, title }: Props) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      aria-label={saved ? `Remove bookmark for ${title}` : `Bookmark ${title}`}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setSaved((s) => !s);
      }}
      style={{
        flexShrink: 0,
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "2px 0 0 4px",
        color: saved ? "#2563EB" : "#D1D5DB",
        display: "flex",
        alignItems: "center",
        transition: "color 0.15s",
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill={saved ? "#2563EB" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
        />
      </svg>
    </button>
  );
}