"use client";

import { useEffect } from "react";

export default function TestPage() {
  useEffect(() => {
    console.log("HYDRATED");
    document.body.style.background = "red";
  }, []);

  return <h1>Test</h1>;
}