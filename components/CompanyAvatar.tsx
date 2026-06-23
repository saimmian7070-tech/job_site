"use client";

import { useState } from "react";

interface CompanyAvatarProps {
  logoUrl?: string;
  initials: string;
  colorClass: string;
  size?: number;
}

export default function CompanyAvatar({
  logoUrl,
  initials,
  colorClass,
  size = 64,
}: CompanyAvatarProps) {
  const [imgFailed, setImgFailed] = useState(false);

  const showImage = logoUrl && !imgFailed;

  return (
    <div
      className={`rounded-2xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden ${
        showImage ? "bg-white border border-gray-100" : colorClass
      }`}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          width={size}
          height={size}
          className="w-full h-full object-contain p-2"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span
          className="font-black text-white select-none"
          style={{ fontSize: size * 0.28 }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}