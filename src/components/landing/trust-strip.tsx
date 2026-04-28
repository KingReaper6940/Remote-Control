const stats = [
  { value: "<50ms", label: "average bridge latency" },
  { value: "98%", label: "first-task success" },
  { value: "12s", label: "average pair-to-online" },
  { value: "100%", label: "user-owned machines" },
  { value: "0", label: "credentials stored" },
  { value: "24/7", label: "always-on connectors" },
];

export function TrustStrip() {
  const items = [...stats, ...stats];
  return (
    <section className="border-b border-border py-10">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-[0.72rem] font-medium uppercase tracking-[0.18em] text-muted">
          Built for people who keep shipping
        </p>
        <div className="mask-fade-x mt-6 overflow-hidden">
          <div className="animate-marquee flex w-max gap-12">
            {items.map((stat, idx) => (
              <div
                key={`${stat.label}-${idx}`}
                className="flex shrink-0 items-baseline gap-3"
              >
                <span className="text-2xl font-semibold tracking-tight">
                  {stat.value}
                </span>
                <span className="text-sm text-muted">{stat.label}</span>
                <span className="ml-6 h-1 w-1 rounded-full bg-border-strong" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
