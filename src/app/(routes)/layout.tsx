import { Footer, Navbar } from "@/components";

// The old version kept a full-screen loader mounted on top of the page and
// only revealed content 500ms after hydration. On slow phones hydration itself
// takes seconds, so users stared at a spinner. The page is server-rendered,
// so we can just show it.
export default function RoutesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="w-full min-h-screen">{children}</main>
      <Footer />
    </div>
  );
}
