import { ShieldCheck, TrendingUp, Clock, Award, Star, Quote } from "lucide-react";

export function WorkSocialProof() {
  const stats = [
    {
      value: "2,500+",
      label: "Monthly Patient Bookings",
      detail: "Handled hands-off via WhatsApp & web",
      icon: TrendingUp,
    },
    {
      value: "100%",
      label: "Collision-Free Scheduling",
      detail: "Zero double-bookings with atomic locking",
      icon: ShieldCheck,
    },
    {
      value: "3–5 Wks",
      label: "Average Production Go-Live",
      detail: "From architecture scoping to launch",
      icon: Clock,
    },
    {
      value: "10,000+",
      label: "Stock Movements Monitored",
      detail: "Across live ERP & retail deployments",
      icon: Award,
    },
  ];

  const clientTypes = [
    { name: "Garwan Law Chamber", label: "Corporate Legal Chamber", verified: true },
    { name: "Dr. Iqbal Kharal Practice", label: "Neurosurgery Clinical Practice", verified: true },
    { name: "Rahmania Medical Center", label: "Specialist Medical Center", verified: true },
    { name: "Regional Supply Distributor", label: "Multi-Warehouse Wholesale Group", verified: true },
    { name: "Hospitality Brands", label: "Fast-Casual Dining & Retail POS", verified: true },
  ];

  return (
    <div className="mt-16 space-y-12">
      {/* Stats Counter Row */}
      <div className="rounded-3xl border border-border/80 bg-gradient-to-b from-card/80 to-card/40 p-6 sm:p-8 backdrop-blur-md">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex flex-col items-start border-l-2 border-brand/40 pl-4 sm:pl-5">
                <div className="flex items-center gap-2 text-brand">
                  <Icon className="h-4 w-4" />
                  <span className="font-mono text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    {stat.value}
                  </span>
                </div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-foreground/90 sm:text-sm">
                  {stat.label}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">{stat.detail}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust & Client Strip */}
      <div className="rounded-2xl border border-border/60 bg-card/30 px-6 py-5">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Verified Deployments Across
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-medium text-foreground/80">
            {clientTypes.map((c) => (
              <div
                key={c.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-3.5 py-1.5 text-xs transition-colors hover:border-brand/30 hover:text-foreground"
              >
                <span className="text-brand">✦</span>
                <span className="font-medium">{c.name}</span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">({c.label})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Client Written Testimonial */}
      <div className="rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/5 via-card/60 to-card/40 p-6 sm:p-8 relative overflow-hidden">
        <Quote className="absolute right-6 top-6 h-16 w-16 text-brand/10 pointer-events-none" />
        <div className="flex items-center gap-1 text-amber-400 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
          ))}
          <span className="ml-2 text-xs font-semibold text-foreground/80">Verified Production Client</span>
        </div>
        <p className="font-display text-base sm:text-lg italic text-foreground/95 leading-relaxed">
          &ldquo;Tech Agenz eliminated the phone chaos in our clinic. In less than 3 weeks, we went from patients waiting 2 hours in a packed lobby to an automated WhatsApp queue where patients receive instant tokens and arrive right on time.&rdquo;
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4">
          <div>
            <div className="text-sm font-bold text-foreground">Clinical Operations Lead</div>
            <div className="text-xs text-muted-foreground">Specialist Neurosurgery & Surgical Clinic</div>
          </div>
          <div className="text-right">
            <div className="font-mono text-xs font-semibold text-emerald-400">1,800+ Monthly Bookings</div>
            <div className="text-[11px] text-muted-foreground">Zero Double-Booking Incidents</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkSocialProof;
