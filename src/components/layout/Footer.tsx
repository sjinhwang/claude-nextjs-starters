import Container from "./Container";

export default function Footer() {
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
