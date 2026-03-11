"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for exploring and personal projects.",
      features: [
        "5 repository analyses per month",
        "Basic repository summaries",
        "Star history (30 days)",
        "Public repositories only",
        "Community support",
      ],
      cta: "Get started",
      ctaAction: "link" as const,
      ctaHref: "/dashboards",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "$12",
      period: "per month",
      description: "For developers who want deeper insights.",
      features: [
        "Unlimited repository analyses",
        "AI-powered detailed summaries",
        "Full star history & analytics",
        "Private repository access",
        "PR tracking & notifications",
        "Version update alerts",
        "Priority support",
      ],
      cta: "Start free trial",
      ctaAction: "signin" as const,
      highlighted: true,
    },
    {
      name: "Team",
      price: "$49",
      period: "per month",
      description: "For teams tracking multiple projects.",
      features: [
        "Everything in Pro",
        "Up to 10 team members",
        "Team dashboards",
        "Shared watchlists",
        "API access",
        "Slack & Discord integrations",
        "Dedicated support",
      ],
      cta: "Contact sales",
      ctaAction: "contact" as const,
      ctaHref: "mailto:sales@github-analyzer.example.com",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">
            Pricing
          </p>
          <h2 className="mt-3 text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Start for free, upgrade when you need more power.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border p-8 ${
                plan.highlighted
                  ? "border-accent bg-card shadow-lg shadow-accent/10"
                  : "border-border bg-card"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
                    Most popular
                  </span>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="mt-6">
                <span className="text-4xl font-bold text-foreground">
                  {plan.price}
                </span>
                <span className="text-muted-foreground">
                  {" "}
                  / {plan.period}
                </span>
              </div>

              <ul className="mt-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span className="text-sm text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                {plan.ctaAction === "link" && plan.ctaHref ? (
                  <Button
                    asChild
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <Link href={plan.ctaHref}>{plan.cta}</Link>
                  </Button>
                ) : plan.ctaAction === "signin" ? (
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                    onClick={() => signIn("google", { callbackUrl: "/dashboards" })}
                  >
                    {plan.cta}
                  </Button>
                ) : plan.ctaAction === "contact" && plan.ctaHref ? (
                  <Button
                    asChild
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    <a href={plan.ctaHref} target="_blank" rel="noopener noreferrer">
                      {plan.cta}
                    </a>
                  </Button>
                ) : (
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-accent text-accent-foreground hover:bg-accent/90"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
