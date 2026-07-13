"use client";

import { useState } from "react";
import { FileText, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import LogoutButton from "./LogoutButton";
import AdminSidebar from "./AdminSidebar";

/**
 * 인증된 어드민 앱 셸 — 헤더 + 사이드바 + 콘텐츠.
 * 데스크톱은 사이드바 항상 노출, 모바일(md 미만)은 햄버거 버튼으로
 * 여닫는 오버레이 드로어로 전환한다(T802 반응형 대응).
 */
export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 px-4 dark:border-zinc-800 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="메뉴 열기/닫기"
            className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 md:hidden"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="rounded-md bg-zinc-100 p-1.5 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            <FileText size={18} />
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">
            견적서 관리 시스템
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LogoutButton />
        </div>
      </header>

      <div className="flex flex-1">
        {/* 데스크톱 고정 사이드바 */}
        <aside className="hidden w-56 shrink-0 border-r border-zinc-200 p-4 dark:border-zinc-800 md:block">
          <AdminSidebar />
        </aside>

        {/* 모바일 오버레이 드로어 */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <aside className="absolute inset-y-0 left-0 w-64 border-r border-zinc-200 bg-white p-4 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
              <AdminSidebar onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
