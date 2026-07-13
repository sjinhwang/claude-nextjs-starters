"use client";

import { usePathname } from "next/navigation";
import Container from "./Container";

export default function Footer() {
  const pathname = usePathname();

  // 어드민 영역은 자체 앱 셸(admin/layout.tsx)을 사용하므로 공통 푸터를 숨긴다.
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <Container className="py-6">
        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
          © {new Date().getFullYear()} InvoiceHub. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
