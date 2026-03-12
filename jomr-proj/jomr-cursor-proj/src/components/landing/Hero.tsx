"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, GitPullRequest, Tag } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-32">
      {/* Background grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5 text-sm text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-accent" />
            Now with AI-powered insights
          </div>

          <h1 className="text-pretty text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Unlock the power of
            <span className="block text-accent">GitHub repositories</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Get instant insights, summaries, star analytics, cool facts, latest
            pull requests, and version updates for any open source repository.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="/dashboards">
                Get started free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/chat">View demo</Link>
            </Button>
          </div>
        </div>

        {/* Mock repo card */}
        <div className="mx-auto mt-16 max-w-4xl">
          <div className="rounded-xl border border-border bg-card p-6 shadow-2xl shadow-black/50">
            <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                  <span className="text-lg font-bold text-foreground">⚛️</span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">
                    facebook/react
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-1">
                    The library for web and native user interfaces
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div className="flex items-center gap-1.5">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-foreground">
                    229k
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <GitPullRequest className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-foreground">423</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    v19.1.0
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Weekly Stars
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  +1,284
                </p>
                <p className="text-xs text-accent">↑ 12% from last week</p>
              </div>
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Active PRs
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">47</p>
                <p className="text-xs text-muted-foreground">
                  8 merged this week
                </p>
              </div>
              <div className="rounded-lg bg-secondary p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Latest Update
                </p>
                <p className="mt-1 text-2xl font-bold text-foreground">2h ago</p>
                <p className="text-xs text-muted-foreground">
                  Server Actions fix
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
