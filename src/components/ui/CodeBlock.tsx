"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  language = "tsx",
  className,
}: {
  code: string;
  language?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API를 사용할 수 없는 환경
    }
  };

  return (
    <div className={cn("overflow-hidden", className)}>
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900 px-4 py-2">
        <span className="font-mono text-xs text-zinc-500">{language}</span>
        <button
          onClick={handleCopy}
          aria-label="코드 복사"
          className="flex items-center gap-1.5 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
        >
          {copied ? (
            <>
              <Check size={12} />
              복사됨
            </>
          ) : (
            <>
              <Copy size={12} />
              복사
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto bg-zinc-950 p-4 text-sm text-zinc-100">
        <code className="font-mono leading-relaxed">{code}</code>
      </pre>
    </div>
  );
}
