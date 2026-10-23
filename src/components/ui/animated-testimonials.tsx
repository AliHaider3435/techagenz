import { useEffect, useState } from "react";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src?: string;
};

type AnimatedTestimonialsProps = {
  testimonials: Testimonial[];
  autoRotateInterval?: number;
};

const createPlaceholderAvatar = (name: string, accent: string) => {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" rx="28" fill="#050b14" />
      <circle cx="80" cy="62" r="34" fill="${accent}" opacity="0.35" />
      <rect x="34" y="102" width="92" height="28" rx="14" fill="${accent}" opacity="0.24" />
      <text x="80" y="95" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="700" fill="#f8fafc">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

export function AnimatedTestimonials({
  testimonials,
  autoRotateInterval = 5000,
}: AnimatedTestimonialsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!testimonials?.length) return;
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, autoRotateInterval);

    return () => window.clearInterval(interval);
  }, [testimonials, autoRotateInterval]);

  if (!testimonials?.length) return null;

  const activeTestimonial = testimonials[activeIndex];

  return (
    <div className="mx-auto max-w-5xl rounded-[28px] border border-white/10 bg-card/70 p-5 shadow-[0_0_80px_rgba(56,189,248,0.12)] backdrop-blur-xl sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[24px] border border-brand/20 bg-background/70 p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-brand">
            <span className="h-2.5 w-2.5 rounded-full bg-brand" /> Client stories
          </div>
          <p className="text-xl leading-relaxed text-foreground sm:text-2xl">
            “{activeTestimonial.quote}”
          </p>

          <div className="mt-8 flex items-center gap-4">
            <img
              src={
                activeTestimonial.src || createPlaceholderAvatar(activeTestimonial.name, "#38BDF8")
              }
              alt={activeTestimonial.name}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-brand/30"
              loading="lazy"
            />
            <div>
              <div className="font-semibold text-foreground">{activeTestimonial.name}</div>
              <div className="text-sm text-muted-foreground">{activeTestimonial.designation}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {testimonials.map((testimonial, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${testimonial.name}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`flex w-full items-center gap-3 rounded-[18px] border p-3 text-left transition-all ${
                  isActive
                    ? "border-brand/50 bg-brand/10 shadow-[0_0_0_1px_rgba(56,189,248,0.08)]"
                    : "border-border/60 bg-background/40 hover:border-brand/30 hover:bg-brand/5"
                }`}
              >
                <img
                  src={testimonial.src || createPlaceholderAvatar(testimonial.name, "#0EA5E9")}
                  alt={testimonial.name}
                  className="h-11 w-11 rounded-full object-cover"
                  loading="lazy"
                />
                <div className="min-w-0">
                  <div className="truncate font-medium text-foreground">{testimonial.name}</div>
                  <div className="truncate text-sm text-muted-foreground">
                    {testimonial.designation}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AnimatedTestimonialsDemo() {
  const testimonials = [
    {
      quote:
        "Tech Agenz engineered a modern, authoritative legal portal for our law chamber. Client inquiries, case consultation bookings, and digital intakes are now handled seamlessly.",
      name: "Advocate Muhammad Usman",
      designation: "Managing Partner at Garwan Law Chamber",
    },
    {
      quote:
        "The appointment booking and queue management system transformed our patient scheduling. Patient wait times dropped and scheduling via mobile is effortless.",
      name: "Dr. Iqbal Ahmad Kharal",
      designation: "Head of Clinical Services",
    },
    {
      quote:
        "A reliable, beautifully built healthcare scheduling platform. Tech Agenz delivered ahead of schedule with exceptional technical execution.",
      name: "Dr. Sajid Sohail",
      designation: "Consultant Physician",
    },
    {
      quote:
        "Their autonomous workflow pipelines streamlined our operations and cut manual processing time in half. True engineering discipline and applied AI.",
      name: "Hamza Tariq",
      designation: "Founder at FinEdge Systems",
    },
    {
      quote:
        "High-performance architecture, clean animations, and rock-solid reliability. Tech Agenz is our go-to engineering partner for digital platforms.",
      name: "Asad Malik",
      designation: "Operations Director at ScaleCloud",
    },
  ];

  return <AnimatedTestimonials testimonials={testimonials} />;
}
