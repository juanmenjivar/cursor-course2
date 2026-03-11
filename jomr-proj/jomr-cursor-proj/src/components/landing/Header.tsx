"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { Github, Menu, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#stats", label: "Stats" },
];

export function Header() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Github className="h-6 w-6 text-accent" />
          <span className="text-lg font-semibold text-foreground">
            GitHub Analyzer
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          {mounted ? (
            <Button
              variant="ghost"
              size="icon"
              className="relative h-8 w-8 shrink-0"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
          ) : (
            <div className="h-8 w-8 shrink-0" aria-hidden />
          )}

          {status === "loading" ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-secondary" />
          ) : session?.user ? (
            <>
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? "Avatar"}
                  width={32}
                  height={32}
                  className="hidden rounded-full sm:block"
                />
              )}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex"
                onClick={() => signOut()}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="hidden text-muted-foreground hover:text-foreground sm:flex"
                onClick={() => signIn("google", { callbackUrl: "/" })}
              >
                Log in
              </Button>
              <Button
                size="sm"
                className="hidden bg-primary text-primary-foreground hover:bg-primary/90 sm:flex"
                onClick={() => signIn("google", { callbackUrl: "/" })}
              >
                Sign up
              </Button>
            </>
          )}
          <Button size="sm" variant="outline" asChild className="hidden sm:flex">
            <Link href="/dashboards">Dashboard</Link>
          </Button>
          <Button size="sm" variant="outline" asChild className="hidden sm:flex">
            <Link href="/chat">AI Chat</Link>
          </Button>

          {/* Mobile menu - only render after mount to avoid Radix ID hydration mismatch */}
          {mounted ? (
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 pt-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="my-2 border-t border-border" />
                <Link
                  href="/dashboards"
                  className="rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/chat"
                  className="rounded-lg px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  AI Chat
                </Link>
                {session?.user ? (
                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      setMobileOpen(false);
                    }}
                    className="rounded-lg px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    Sign out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      signIn("google", { callbackUrl: "/" });
                      setMobileOpen(false);
                    }}
                    className="rounded-lg px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    Log in / Sign up
                  </button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          ) : (
            <div className="h-8 w-8 md:hidden" aria-hidden />
          )}
        </div>
      </div>
    </header>
  );
}
