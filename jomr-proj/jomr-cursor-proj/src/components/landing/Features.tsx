import {
  Star,
  GitPullRequest,
  Tag,
  Zap,
  BarChart3,
  Sparkles,
} from "lucide-react";

export function Features() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Summaries",
      description:
        "Get intelligent summaries of any repository with key insights, architecture overview, and tech stack analysis.",
    },
    {
      icon: Star,
      title: "Star Analytics",
      description:
        "Track star growth over time, identify trending repos, and understand what makes projects popular.",
    },
    {
      icon: Zap,
      title: "Cool Facts",
      description:
        "Discover interesting facts about repos: top contributors, code patterns, and hidden gems in the codebase.",
    },
    {
      icon: GitPullRequest,
      title: "Important PRs",
      description:
        "Stay updated with the latest significant pull requests, breaking changes, and feature additions.",
    },
    {
      icon: Tag,
      title: "Version Updates",
      description:
        "Get notified about new releases, changelog summaries, and migration guides for your dependencies.",
    },
    {
      icon: BarChart3,
      title: "Activity Dashboard",
      description:
        "Visualize repository health metrics, commit frequency, and community engagement trends.",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">
            Features
          </p>
          <h2 className="mt-3 text-pretty text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Everything you need to understand open source
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Powerful tools to analyze, track, and stay updated with the
            repositories that matter to you.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-accent/50 hover:bg-secondary/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
