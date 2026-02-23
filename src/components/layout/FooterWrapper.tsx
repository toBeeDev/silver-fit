"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function FooterWrapper() {
  if (usePathname() === "/") return null;
  return <Footer />;
}
