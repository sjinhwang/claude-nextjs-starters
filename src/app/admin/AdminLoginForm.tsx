"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { login } from "./actions";
import { RATE_LIMIT_ERROR_MESSAGE } from "@/lib/rate-limit";

/** F006: 어드민 비밀번호 인증 폼 (순수 인증만 담당, 견적서 조회는 하지 않음) */
export default function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setAuthError("");
    try {
      const result = await login(password);
      if (!result.success) {
        // 로그인 시도 Rate Limit 초과 시 전용 안내 메시지 표시
        if (result.error === RATE_LIMIT_ERROR_MESSAGE) {
          setAuthError("로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.");
        } else {
          setAuthError("비밀번호가 올바르지 않습니다.");
        }
        return;
      }
      // 세션 쿠키가 설정되었으므로 서버 컴포넌트(layout)를 다시 렌더링해 인증 화면을 통과시킨다.
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>어드민 로그인</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              비밀번호
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="어드민 비밀번호 입력"
              required
            />
          </div>
          {authError && (
            <p className="text-sm text-red-600 dark:text-red-400">{authError}</p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "확인 중..." : "로그인"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
