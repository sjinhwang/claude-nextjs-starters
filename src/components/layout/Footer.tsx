import Container from "./Container";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white py-6 dark:border-zinc-800 dark:bg-zinc-950">
      <Container>
        <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
          © {new Date().getFullYear()} Next.js Starter. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
