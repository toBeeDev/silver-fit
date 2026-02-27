"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

const HIDDEN_PATHS = ["/", "/chat"];

export default function FooterWrapper() {
  const pathname = usePathname();
  if (HIDDEN_PATHS.includes(pathname)) return null;
  return <Footer />;
}
