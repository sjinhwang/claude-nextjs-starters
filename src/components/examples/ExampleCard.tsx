"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { CodeBlock } from "@/components/ui/CodeBlock";

interface ExampleCardProps {
  title: string;
  description: string;
  techStack: string;
  code: string;
  language?: string;
  children: React.ReactNode;
}

export function ExampleCard({
  title,
  description,
  techStack,
  code,
  language = "tsx",
  children,
}: ExampleCardProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="flex items-start justify-between border-b border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex-1 pr-4">
          <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-50">
            {title}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        </div>
        <Badge variant="secondary">{techStack}</Badge>
      </div>
      <div className="flex min-h-[120px] flex-wrap items-center justify-center gap-3 bg-zinc-50 p-8 dark:bg-zinc-950">
        {children}
      </div>
      <div className="border-t border-zinc-200 dark:border-zinc-800">
        <button
          onClick={() => setShowCode(!showCode)}
          className="flex w-full items-center gap-1.5 bg-white px-4 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
        >
          {showCode ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {showCode ? "코드 숨기기" : "코드 보기"}
        </button>
        {showCode && <CodeBlock code={code} language={language} />}
      </div>
    </div>
  );
}
