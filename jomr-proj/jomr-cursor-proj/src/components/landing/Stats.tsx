export function Stats() {
  const stats = [
    { value: "10M+", label: "Repositories analyzed" },
    { value: "98%", label: "Accuracy rate" },
    { value: "50k+", label: "Active developers" },
    { value: "2s", label: "Average analysis time" },
  ];

  return (
    <section id="stats" className="border-y border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
