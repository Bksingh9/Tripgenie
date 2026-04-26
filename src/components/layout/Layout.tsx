import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:shadow-lg"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 pt-16 focus:outline-none">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
}
