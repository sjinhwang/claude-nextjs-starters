"use client";

import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";

export default function PrintButton() {
  return (
    <Button onClick={() => window.print()} size="lg">
      <Download />
      PDF로 저장
    </Button>
  );
}
