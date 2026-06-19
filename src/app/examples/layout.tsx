import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "예제",
};

export default function ExamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
