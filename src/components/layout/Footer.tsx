import Link from "next/link";
import Container from "./Container";

const footerLinks = [
  {
    title: "프로젝트",
    links: [
      { href: "/", label: "홈" },
      { href: "/about", label: "소개" },
      { href: "/docs", label: "문서" },
    ],
  },
  {
    title: "기술 스택",
    links: [
      { href: "https://nextjs.org", label: "Next.js" },
      { href: "https://react.dev", label: "React" },
      { href: "https://tailwindcss.com", label: "Tailwind CSS" },
    ],
  },
  {
    title: "리소스",
    links: [
      { href: "https://github.com", label: "GitHub" },
      { href: "/api/hello", label: "API 예시" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <Container className="py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* 브랜드 */}
          <div className="sm:col-span-2 md:col-span-1">
            <p className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Next.js Starter
            </p>
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Next.js 16 + React 19 + Tailwind CSS v4 기반의 스타터 템플릿
            </p>
          </div>

          {/* 링크 그룹 */}
          {footerLinks.map(({ title, links }) => (
            <div key={title}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {title}
              </p>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-zinc-100 pt-6 dark:border-zinc-800">
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
            © {new Date().getFullYear()} Next.js Starter. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
