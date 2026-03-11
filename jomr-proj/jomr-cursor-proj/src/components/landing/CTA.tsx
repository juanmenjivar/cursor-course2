import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to unlock repository insights?
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Join thousands of developers who use GitHub Analyzer to stay ahead.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              asChild
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90 sm:w-auto"
            >
              <Link href="/dashboards">
                Start for free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full border-border text-foreground hover:bg-secondary sm:w-auto"
            >
              <Link href="/chat">Schedule a demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
