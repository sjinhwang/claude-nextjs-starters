"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/admin", label: "대시보드", icon: Home },
  { href: "/admin/invoices", label: "견적서 목록", icon: FileText },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-zinc-200 p-4 dark:border-zinc-800">
      <nav className="flex flex-col gap-1">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/admin" ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
