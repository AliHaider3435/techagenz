import { createFileRoute, Link } from "@tanstack/react-router";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BouncyButton from "@/components/BouncyButton";
import RevealSection from "@/components/RevealSection";
import { useEffect, useRef, useState } from "react";
import WhatsAppButton from "@/components/WhatsAppButton";
import {
  useTransform,
  useMotionValue,
  useInView,
  animate,
  MotionValue,
  motion,
} from "framer-motion";
import { ChevronRight } from "lucide-react";
import {
  Brain,
  Cpu,
  Code2,
  Database,
  ArrowUpRight,
  Sparkles,
  Shield,
  Zap,
  Rocket,
  Mail,
  Phone,
  MapPin,
  Star,
  Instagram,
  Linkedin,
  Github,
  Twitter,
  MessageSquare,
} from "lucide-react";
import { TechCursor } from "@/components/TechCursor";
import TeamSection from "@/components/TeamSection";
import { AnimatedTestimonialsDemo } from "@/components/ui/animated-testimonials";
import { SplineScene } from "@/components/ui/spline-scene";
import { getBlogs, fetchLiveCmsData, CMS_UPDATE_EVENT } from "@/lib/cms-store";
import { getFeaturedProjects } from "@/lib/projects-data";
import ProjectCard from "@/components/ProjectCard";
import WorkSocialProof from "@/components/WorkSocialProof";
import workDev from "@/assets/work-dev.webp";
import workDevCard from "@/assets/work-dev-card.webp";
import workSaas from "@/assets/work-saas.webp";
import workSaasCard from "@/assets/work-saas-card.webp";
import workData from "@/assets/work-data.webp";
import workDataCard from "@/assets/work-data-card.webp";
import robotHero from "@/assets/robot-hero.png";
// secure-ai.webp was removed — alias to workDev for the WhatsApp automation card
const secureAi = workDev;
const secureAiCard = workDevCard;
import garwanLawChamber from "@/assets/garwan-law-chamber.webp";
import drIqbalKharal from "@/assets/dr-iqbal-kharal.webp";
import drSajidSohail from "@/assets/dr-sajid-sohail.webp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tech Agenz — AI-Powered Software House in Pakistan" },
      {
        name: "description",
        content:
          "Tech Agenz is an AI-powered software house helping businesses simplify complex operations, automate repetitive tasks, and build smarter digital experiences. Smart business automation, custom software, ERPNext, WhatsApp & AI chatbot development.",
      },
      { property: "og:title", content: "Tech Agenz — AI-Powered Software House in Pakistan" },
      {
        property: "og:description",
        content:
          "Simplify complex operations, automate repetitive tasks, and build smarter digital experiences with Tech Agenz.",
      },
      { property: "og:url", content: "https://techagenz.com/" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://techagenz.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Tech Agenz — AI-Powered Software House in Pakistan" },
      {
        name: "twitter:description",
        content:
          "Simplify complex operations, automate repetitive tasks, and build smarter digital experiences with Tech Agenz. AI Automation, WhatsApp Automation, ERPNext & Custom Software.",
      },
      { name: "twitter:image", content: "https://techagenz.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://techagenz.com/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <TechCursor />
      <WhatsAppButton />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <AIVision />
        <RevealSection>
          <Services />
        </RevealSection>
        <RevealSection>
          <WhyChooseUs />
        </RevealSection>
        <RevealSection>
          <About />
        </RevealSection>
        <RevealSection>
          <Impact />
        </RevealSection>
        <RevealSection>
          <div id="team"></div>
          <TeamSection />
        </RevealSection>
        <RevealSection>
          <Work />
        </RevealSection>
        <RevealSection>
          <Testimonials />
        </RevealSection>
        <RevealSection>
          <BlogsTeaser />
        </RevealSection>
        <RevealSection>
          <CTA />
        </RevealSection>
      </main>
      <Footer />
    </div>
  );
}

function Hero() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const orbitRefs = useRef<Array<HTMLDivElement | null>>([]);
  const splineAppRef = useRef<unknown>(null);
  const [isRobotActive, setIsRobotActive] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    const scene = sceneRef.current;
    if (!el || !scene) return;
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      scene.style.transform = `perspective(1000px) rotateX(${dy * -6}deg) rotateY(${dx * 8}deg) translate3d(${dx * 12}px, ${dy * 12}px, 0)`;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(calc(-50% + ${dx * 18}px), calc(-30% + ${dy * 18}px))`;
      }
      orbitRefs.current.forEach((orbit, index) => {
        if (orbit) {
          const factor = index === 0 ? 24 : 36;
          orbit.style.transform = `translate3d(${dx * factor}px, ${dy * factor}px, 0)`;
        }
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const handleSplineLoad = (app: unknown) => {
    splineAppRef.current = app;
    // SplineScene is only mounted after user clicks — let animation play immediately
  };

  const handleStartRobot = () => {
    setIsRobotActive(true);
    // splineAppRef will be set via handleSplineLoad after the lazy component loads
  };

  return (
    <section id="home" ref={wrapRef} className="relative min-h-screen pt-32 pb-16">
      {/* animated grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.7 0.19 240 / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.19 240 / 0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)",
        }}
      />
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "radial-gradient(circle, oklch(0.7 0.19 240 / 0.35), transparent 60%)",
          transform: "translate(-50%, -30%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-[1.3fr_1fr] lg:px-16">
        {/* Left: eyebrow + title + content */}
        <div className="min-w-0 space-y-7 lg:max-w-2xl lg:pl-8">
          <div className="font-display inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1 text-xs uppercase tracking-[0.25em] text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse-glow" />
            AI-Powered Software House in Pakistan
          </div>

          <div className="relative inline-block">
            <div className="absolute -left-3 -top-3 h-4 w-4 border-l-2 border-t-2 border-brand" />
            <div className="absolute -right-3 -top-3 h-4 w-4 border-r-2 border-t-2 border-brand" />
            <div className="absolute -left-3 -bottom-3 h-4 w-4 border-b-2 border-l-2 border-brand" />
            <div className="absolute -right-3 -bottom-3 h-4 w-4 border-b-2 border-r-2 border-brand" />
            <h1 className="font-hero max-w-xl px-4 py-2 text-3xl font-bold uppercase leading-[1.18] tracking-wide sm:text-4xl lg:text-[2.65rem]">
              Simplify Complex Operations.
              <br />
              Automate Repetitive Tasks.
              <br />
              <span className="text-gradient-brand">Build Smarter Digital Experiences.</span>
              <span className="mt-3.5 block text-xs sm:text-sm font-semibold tracking-normal text-cyan-300 font-display normal-case">
                AI Automation &amp; Software House in Pakistan &bull; WhatsApp Automation &bull;
                ERPNext &bull; Custom Software
              </span>
            </h1>
          </div>

          <p className="font-display max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Tech Agenz is an AI-powered software house helping businesses simplify complex
            operations, automate repetitive tasks, and build smarter digital experiences. As a
            technology partner for growing businesses, we deliver practical solutions that connect
            people, processes, and systems to improve operational efficiency and support long-term
            growth.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/contact"
              className="font-display glow-brand inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Start a project <ArrowUpRight className="h-4 w-4" />
            </Link>
            <a
              href="https://wa.me/923394555004"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
            >
              WhatsApp Us
            </a>
            <div className="font-display glass-card flex items-center gap-2 rounded-full px-4 py-2 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" />
              Clinics &bull; Law Firms &bull; Growing Businesses
            </div>
          </div>
        </div>

        {/* Right: AI Robot - Framed strictly inside circular portal */}
        <div
          ref={sceneRef}
          className="relative mx-auto flex items-center justify-center w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[440px]"
          style={{
            transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)",
            transition: "transform 0.15s ease-out",
          }}
        >
          {/* Main Circular Portal framing the robot: rounded-full overflow-hidden ensures it NEVER overrides or goes outside the circle */}
          <div className="relative z-10 aspect-square w-full rounded-full border border-cyan-400/40 bg-gradient-to-b from-cyan-950/20 via-background/40 to-slate-950/70 p-4 shadow-[0_0_40px_-10px_rgba(34,211,238,0.25)] backdrop-blur-[2px] overflow-hidden flex items-center justify-center">
            {isRobotActive ? (
              /* Only mount Spline AFTER user click — defers the ~2MB bundle from initial load */
              <SplineScene
                scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                className="h-full w-full"
                style={{ background: "transparent" }}
                onLoad={handleSplineLoad}
              />
            ) : (
              /* Original 3D Robot preview — kept strictly inside the circle */
              <div
                onClick={handleStartRobot}
                onTouchStart={handleStartRobot}
                className="group absolute inset-0 flex cursor-pointer flex-col items-center justify-center select-none p-3"
                aria-label="Click to start interactive 3D robot animation"
              >
                {/* 3D Robot Image centered and scaled safely inside circle */}
                <div className="relative flex h-full w-full items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
                  <img
                    src={robotHero}
                    alt="Tech Agenz AI Robot"
                    width={351}
                    height={327}
                    className="relative z-10 max-h-[82%] max-w-[88%] object-contain drop-shadow-[0_8px_24px_rgba(34,211,238,0.22)] animate-float-slow pointer-events-none"
                  />
                </div>

                {/* Click / Tap to Animate Trigger Overlay */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                  <button
                    type="button"
                    className="glow-brand inline-flex items-center gap-2 rounded-full border border-cyan-400/60 bg-slate-950/90 px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-cyan-300 shadow-xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
                    </span>
                    <span>Click to animate</span>
                  </button>
                </div>
              </div>
            )}

            {/* Active Status Badge */}
            {isRobotActive && (
              <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-slate-950/80 px-3 py-1 text-[11px] font-medium text-cyan-300 backdrop-blur-md whitespace-nowrap">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Robot Active</span>
              </div>
            )}

            {/* Crisp outer border ring overlay to ensure clean boundary */}
            <div className="pointer-events-none absolute inset-0 rounded-full border border-cyan-400/30 z-30 ring-1 ring-inset ring-cyan-400/20" />
          </div>

          {/* Outer floating orbit rings */}
          <div
            ref={(element) => {
              orbitRefs.current[0] = element;
            }}
            className="pointer-events-none absolute inset-0 z-0 -m-5 rounded-full border border-brand/25 animate-float-slow"
            style={{ transform: "translate3d(0, 0, 0)" }}
          />
          <div
            ref={(element) => {
              orbitRefs.current[1] = element;
            }}
            className="pointer-events-none absolute inset-0 z-0 -m-11 rounded-full border border-dashed border-brand/15"
            style={{ transform: "translate3d(0, 0, 0)" }}
          />
        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = [
    "Smart Business Automation",
    "AI Automation Services",
    "WhatsApp Automation for Business",
    "AI Chatbot Development",
    "Custom Software Development in Pakistan",
    "Web Development Company in Pakistan",
    "ERPNext Implementation",
    "Clinic & Law Firm Systems",
  ];
  return (
    <div className="relative overflow-hidden border-y border-border/70 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 py-10 shadow-[0_0_60px_rgba(59,130,246,0.12)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_35%)] opacity-80" />
      <div className="relative flex animate-marquee gap-14 whitespace-nowrap text-xl font-semibold text-slate-50 sm:text-2xl">
        {[...items, ...items, ...items].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-full bg-white/5 px-4 py-2 text-slate-100 shadow-sm shadow-brand/10 transition-colors duration-300 hover:bg-white/10"
          >
            <Sparkles className="h-5 w-5 text-brand" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
function AIVision() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasPlayedRef = useRef(false);
  const unlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const progress = useMotionValue(0);
  const isInView = useInView(sectionRef, { amount: 0.6 });

  const unlockScroll = () => {
    document.body.style.overflow = "";
    if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
  };

  // Trigger once when the section comes into view:
  // 1) play the video from the start (once, no scroll link)
  // 2) run the 3s word-reveal animation with a matching scroll lock
  useEffect(() => {
    if (!isInView || hasPlayedRef.current) return;
    hasPlayedRef.current = true;

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {
        // autoplay might be blocked until user interacts once — safe to ignore
      });
    }

    document.body.style.overflow = "hidden";
    unlockTimeoutRef.current = setTimeout(unlockScroll, 30);

    animate(progress, 1, {
      duration: 3,
      ease: "easeInOut",
      onComplete: unlockScroll,
    });

    return () => {
      unlockScroll();
    };
  }, [isInView, progress]);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
      if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
    };
  }, []);

  const headline = [
    "Connecting",
    "people,",
    "processes,",
    "and",
    "systems",
    "to",
    "improve",
    "operational",
    "efficiency",
    "and",
    "support",
    "sustainable",
    "long-term",
    "growth.",
  ];

  return (
    <section ref={sectionRef} className="relative h-screen">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* No autoPlay — starts only when isInView triggers video.play() above */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/45 via-background/30 to-background/65" />
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 40%, oklch(0.7 0.19 240 / 0.3), transparent 70%)",
          }}
        />
        <div className="relative mx-auto flex h-full max-w-5xl flex-col justify-center px-6 lg:px-16">
          <div className="font-display inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse-glow" />
            AI Automation &amp; Solutions
          </div>
          <h2 className="font-hero mt-6 flex flex-wrap gap-x-3 gap-y-1 text-3xl font-bold uppercase leading-tight sm:text-4xl lg:text-5xl">
            {headline.map((word, i) => {
              const start = i / headline.length;
              const end = start + 1 / headline.length;
              return <RevealWord key={i} word={word} progress={progress} range={[start, end]} />;
            })}
          </h2>
          <p className="font-display mt-8 max-w-2xl text-sm text-muted-foreground sm:text-base leading-relaxed">
            Whether you need AI automation services, custom business applications, or integrated
            software systems, our team focuses on understanding your challenges and developing
            technology that aligns with your business goals.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <BouncyButton
              href="/work"
              className="font-display inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-6 py-3 text-sm text-foreground"
            >
              Explore Our Work <ArrowUpRight className="h-4 w-4" />
            </BouncyButton>
            <Link
              to="/contact"
              className="font-display inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
            >
              Get In Touch
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function RevealWord({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const color = useTransform(progress, range, ["rgb(115,115,115)", "rgb(255,255,255)"]);
  const opacity = useTransform(progress, range, [0.3, 1]);

  return (
    <motion.span style={{ color, opacity }} className="inline-block">
      {word}
    </motion.span>
  );
}
function Services() {
  const services = [
    {
      icon: Cpu,
      tag: "Process Automation",
      title: "Smart Business Automation & AI Solutions",
      desc: "Streamline everyday operations through business process automation, intelligent workflows, and AI-powered applications reducing manual workloads.",
      img: workSaas,
      imgWidth: 900,
      cardImg: workSaasCard,
    },
    {
      icon: MessageSquare,
      tag: "Customer Communication",
      title: "WhatsApp Automation for Business",
      desc: "Automated messaging workflows for appointment reminders, customer inquiries, lead follow-ups, order updates, and FAQs with consistent service.",
      img: secureAi,
      imgWidth: 600,
      cardImg: secureAiCard,
    },
    {
      icon: Brain,
      tag: "24/7 Intelligent Support",
      title: "AI Chatbot Development",
      desc: "Chatbots connected with business knowledge bases, customer support workflows, and applications to guide visitors and provide round-the-clock answers.",
      img: workDev,
      imgWidth: 900,
      cardImg: workDevCard,
    },
    {
      icon: Code2,
      tag: "Tailored Platforms",
      title: "Custom Software Development in Pakistan",
      desc: "Applications tailored to your workflows, users, and scaling targets — from internal management portals to complete enterprise business platforms.",
      img: workData,
      imgWidth: 900,
      cardImg: workDataCard,
    },
    {
      icon: Rocket,
      tag: "Modern Web Platforms",
      title: "Web Development Company in Pakistan",
      desc: "Modern, responsive, and functional web applications prioritizing usability, performance, security, and scalability for high conversion.",
      img: workDev,
      imgWidth: 900,
      cardImg: workDevCard,
    },
    {
      icon: Database,
      tag: "Enterprise Integration",
      title: "ERPNext Implementation",
      desc: "Bring accounting, inventory, sales, purchasing, and operations into an integrated platform with complete visibility and consistent workflows.",
      img: workSaas,
      imgWidth: 900,
      cardImg: workSaasCard,
    },
  ];
  return (
    <section id="services" className="relative pt-16 pb-20">
      <div className="mx-auto max-w-6xl px-8 lg:px-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="font-display inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse-glow" />
            Our Services
          </div>
          <h2 className="font-cyber mt-4 text-4xl font-bold sm:text-5xl">
            Systems We <span className="text-gradient-brand">Engineer</span>
          </h2>
          <p className="font-display mt-4 text-muted-foreground">
            From smart business automation and WhatsApp workflows to custom web apps and ERPNext, we
            build solutions that eliminate routine workloads and drive growth.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, tag, title, desc, img, imgWidth, cardImg }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-2xl"
              data-cursor="hover"
            >
              {/* neon rotating edge light, masked to a true thin ring */}
              <div
                className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  padding: "1.5px",
                  WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                  WebkitMaskComposite: "xor",
                  maskComposite: "exclude",
                }}
              >
                <div
                  className="absolute inset-[-60%] animate-spin"
                  style={{
                    animationDuration: "3s",
                    background:
                      "conic-gradient(from 0deg, transparent 0%, oklch(0.7 0.19 240) 8%, oklch(0.85 0.15 240) 12%, transparent 24%, transparent 100%)",
                  }}
                />
              </div>

              <div className="glass-card relative flex h-full flex-col justify-between overflow-hidden rounded-2xl transition-transform duration-500 group-hover:-translate-y-1">
                {/* image block */}
                <div>
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={img}
                      srcSet={`${cardImg} 480w, ${img} ${imgWidth}w`}
                      sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 28vw"
                      alt={title}
                      className="h-full w-full object-cover opacity-70 transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="glass-card flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-brand/30">
                        <Icon className="h-5 w-5 text-brand" strokeWidth={1.75} />
                      </div>
                    </div>
                  </div>

                  {/* label block */}
                  <div className="p-5">
                    <div className="font-display text-[11px] uppercase tracking-widest text-brand">
                      {tag}
                    </div>
                    <h3 className="font-cyber mt-1 text-base font-bold text-foreground">{title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{desc}</p>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <Link
                    to="/services"
                    className="font-display inline-flex items-center gap-1 text-xs text-brand transition-colors hover:underline"
                  >
                    Explore capability <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-6 py-3 text-sm font-medium text-foreground transition-transform hover:bg-brand/20 hover:scale-105"
          >
            Explore all capabilities & services <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const points = [
    {
      icon: Shield,
      title: "Practical Implementation",
      desc: "We emphasize practical execution over hype, architecting systems that integrate smoothly into existing workflows and deliver reliable ROI.",
    },
    {
      icon: Zap,
      title: "Workflow Improvement",
      desc: "Our approach starts with identifying high-friction manual tasks and turning them into efficient, error-free automated processes.",
    },
    {
      icon: Database,
      title: "System Integration",
      desc: "Bridging the gap between disconnected software, CRMs, ERPs, and databases into a unified, transparent digital ecosystem.",
    },
    {
      icon: Rocket,
      title: "Scalable Digital Solutions",
      desc: "Engineered with modern cloud foundations that adapt as your organization grows, supporting sustainable long-term business scale.",
    },
  ];

  return (
    <section className="relative py-20 border-y border-border/60 bg-gradient-to-b from-slate-950/40 via-background to-slate-950/40">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <SectionPill>Why Partner With Us</SectionPill>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Why Choose <span className="text-gradient-brand">Tech Agenz?</span>
          </h2>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base leading-relaxed">
            Choosing the right technology partner means finding a team that understands both
            software and the business problems it needs to solve. Tech Agenz emphasizes practical
            implementation, workflow improvement, system integration, and scalable digital
            solutions.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="glass-card group relative rounded-2xl p-6 transition-transform duration-300 hover:border-brand/40 hover:-translate-y-1"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-brand/30 text-brand">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-foreground">{p.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SectionPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1 text-xs uppercase tracking-[0.2em] text-brand">
      {children}
    </div>
  );
}

function About() {
  return (
    <section id="about" className="relative py-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
        <div className="relative">
          <div className="glass-card overflow-hidden rounded-3xl p-2">
            <img
              src={workDev}
              alt="Tech Agenz engineering team at work"
              width={900}
              height={700}
              className="rounded-2xl"
              loading="lazy"
            />
          </div>
          <div className="glass-card absolute -bottom-6 -right-6 hidden rounded-2xl px-5 py-4 sm:block">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/20 ring-1 ring-brand/40">
                <Rocket className="h-5 w-5 text-brand" />
              </div>
              <div>
                <div className="text-sm font-semibold">Specialized Solutions</div>
                <div className="text-xs text-muted-foreground">
                  Clinics, Law Firms & Growing Businesses
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>
          <SectionPill>About Tech Agenz</SectionPill>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Smart Business Automation and <span className="text-gradient-brand">AI Solutions</span>
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Modern businesses need more than traditional software to remain competitive. Tech Agenz
            helps organizations streamline everyday operations through business process automation,
            intelligent workflows, and AI-powered applications. From automating customer
            communication to connecting business tools, we help reduce manual workloads and create
            more efficient processes.
          </p>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            Our solutions support clinics managing patient appointments, law firms organizing client
            inquiries, and growing businesses looking to improve their internal workflows.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
            >
              Learn more about Tech Agenz <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-6 py-3 text-sm font-medium hover:bg-card"
            >
              Contact our team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
function Impact() {
  const stats = [
    {
      value: "50+",
      label: "Projects Delivered",
      desc: "Custom AI systems, production web apps, and automation platforms shipped for ambitious teams.",
    },
    {
      value: "6+",
      label: "Years Building",
      desc: "Years spent architecting reliable systems — from first prototype to global-scale production.",
    },
    {
      value: "98%",
      label: "Client Satisfaction",
      desc: "A track record clients return to, measured in long-term partnerships, not one-off scopes.",
    },
  ];

  return (
    <section id="impact" className="relative py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-8 py-16 sm:px-14 sm:py-20">
          <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand/20 blur-[100px]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(0.7 0.19 240) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.19 240) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative grid gap-16 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div className="flex flex-col gap-8">
              <SectionPill>/ Our Impact</SectionPill>

              <div>
                <h2 className="font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  Numbers that reflect <span className="text-gradient-brand">how we build</span>
                </h2>
                <p className="mt-5 max-w-md text-sm text-slate-400 sm:text-base">
                  Every metric here is earned across real production systems — not vanity figures.
                  It's what happens when engineering discipline meets applied AI.
                </p>
                <Link
                  to="/about"
                  className="mt-8 inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-5 py-2.5 text-sm text-white transition-colors hover:bg-brand/20"
                >
                  Meet the team <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="flex items-end justify-center gap-4 sm:gap-5">
              {stats.map((s, i) => (
                <StatCard key={s.label} {...s} offset={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  value,
  label,
  desc,
  offset,
}: {
  value: string;
  label: string;
  desc: string;
  offset: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay: offset * 0.15, ease: "easeOut" }}
      whileHover={{ y: -10 }}
      className="group relative w-full max-w-[190px]"
      style={{ marginTop: `${offset * 56}px` }}
    >
      <div
        className="relative flex h-full flex-col justify-between gap-6 border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.01] p-5 pb-9 backdrop-blur-sm transition-colors duration-300 group-hover:border-brand/50"
        style={{
          clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 28px), calc(100% - 28px) 100%, 0 100%)",
        }}
      >
        <div>
          <div className="font-display text-3xl font-bold text-white sm:text-4xl">{value}</div>
          <div className="mt-1 text-sm text-slate-300">{label}</div>
        </div>
        <p className="text-xs leading-relaxed text-slate-400">{desc}</p>

        <div
          className="pointer-events-none absolute bottom-0 right-0 h-7 w-7 bg-brand/0 transition-colors duration-300 group-hover:bg-brand/60"
          style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
        />
      </div>
    </motion.div>
  );
}

export { About, StatCard };

function Work() {
  const featuredProjects = getFeaturedProjects();

  return (
    <section id="work" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <SectionPill>Selected Work & Deployments</SectionPill>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Real Systems with <span className="text-gradient-brand">Verifiable Numbers</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Only our highest-impact work. Each card features real production metrics, live architecture, and tangible operational outcomes.
          </p>
        </div>

        {/* 1. Homepage Teaser: 4 Projects Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {featuredProjects.map((project, idx) => (
            <ProjectCard key={project.slug} project={project} priority={idx < 2} />
          ))}
        </div>

        {/* View All Projects Button */}
        <div className="mt-12 text-center">
          <Link
            to="/work"
            className="glow-brand inline-flex items-center gap-2.5 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:scale-105 hover:bg-brand/90 shadow-lg shadow-brand/20"
          >
            <span>View All Projects & Case Studies</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <p className="mt-2.5 text-xs text-muted-foreground">
            Explore deep dives into architecture, database atomicity, and process workflows.
          </p>
        </div>

        {/* Social Proof Strip & Counter Around Grid */}
        <WorkSocialProof />
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="relative py-15">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <SectionPill>Testimonials</SectionPill>
          <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            What our <span className="text-gradient-brand">clients</span> say
          </h2>
        </div>
        <div className="mt-14">
          <AnimatedTestimonialsDemo />
        </div>
      </div>
    </section>
  );
}

function BlogsTeaser() {
  const [posts, setPosts] = useState(() => getBlogs().slice(0, 3));

  useEffect(() => {
    setPosts(getBlogs().slice(0, 3));
    fetchLiveCmsData();
    const handler = () => setPosts(getBlogs().slice(0, 3));
    window.addEventListener(CMS_UPDATE_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(CMS_UPDATE_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  return (
    <section id="blogs" className="relative py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <SectionPill>Insights & Articles</SectionPill>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Latest from our <span className="text-gradient-brand">engineering blog</span>
            </h2>
          </div>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
          >
            View all articles <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              to="/blogs/$slug"
              params={{ slug: p.id }}
              className="glass-card group flex flex-col justify-between overflow-hidden rounded-3xl p-5 sm:p-6 transition-transform duration-300 hover:border-brand/40 hover:-translate-y-1 shadow-lg"
            >
              <div>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl mb-4 bg-slate-950">
                  <img
                    src={p.image}
                    alt={p.title}
                    width={600}
                    height={340}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = "/blog-images/ai-software-house-pakistan.webp";
                    }}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="rounded-full bg-slate-950/80 px-2.5 py-0.5 text-[11px] font-medium text-cyan-300 border border-cyan-500/20 backdrop-blur-sm">
                      {p.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{p.date}</span>
                  <span>{p.readTime}</span>
                </div>

                <h3 className="mt-3 font-display text-base font-semibold leading-snug transition-colors group-hover:text-brand line-clamp-2">
                  {p.title}
                </h3>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3.5 text-xs text-muted-foreground">
                <span className="text-brand font-medium">Read article</span>
                <span className="inline-flex items-center gap-1 font-medium text-brand">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    let success = false;

    // 1. Primary: Send through server endpoint
    try {
      const res = await fetch("/api/send-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        success = true;
      }
    } catch {
      // Endpoint unreachable, continue to fallback
    }

    // 2. Direct client fallback: FormSubmit directly to info@techagenz.com
    if (!success) {
      try {
        const fallbackRes = await fetch("https://formsubmit.co/ajax/info@techagenz.com", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            company: formData.company || "Not specified",
            message: formData.message,
            _subject: `New Enquiry from ${formData.name}`,
            _replyto: formData.email,
          }),
        });

        if (fallbackRes.ok) {
          success = true;
        }
      } catch {
        // Fallback failed
      }
    }

    if (success) {
      setStatus("sent");
      setFormData({ name: "", email: "", company: "", message: "" });
    } else {
      setStatus("error");
      setErrorMessage(
        "Something went wrong — please try again or email info@techagenz.com directly.",
      );
    }
  };

  return (
    <section id="contact" className="relative py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="glass-card relative overflow-hidden rounded-3xl px-8 py-14 sm:px-14 sm:py-20">
          <div className="absolute -top-24 left-1/2 h-64 w-[700px] -translate-x-1/2 rounded-full bg-brand/30 blur-3xl" />
          <div className="relative grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <SectionPill>
                <Zap className="h-3 w-3" /> Get Started Today
              </SectionPill>
              <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Transform Your Business with <br />
                <span className="text-gradient-brand">Smarter Technology.</span>
              </h2>
              <p className="mt-4 max-w-lg text-sm text-muted-foreground sm:text-base leading-relaxed">
                Ready to improve your workflows, simplify customer communication, or modernize your
                business systems? Tech Agenz can help you explore AI automation, custom software,
                intelligent chatbots, web applications, and ERPNext solutions aligned with your
                needs.
              </p>
              <p className="mt-2 text-xs text-brand font-medium">
                Contact Tech Agenz to discuss your business challenges and discover the right
                technology solution for your next stage of growth.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="mailto:info@techagenz.com"
                  className="glow-brand inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.03]"
                >
                  Email us <ArrowUpRight className="h-4 w-4" />
                </a>
                <a
                  href="tel:03394555004"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-6 py-3 text-sm hover:bg-card"
                >
                  Schedule a call
                </a>
              </div>
            </div>

            <div className="space-y-4">
              <form
                onSubmit={handleSubmit}
                className="space-y-3 rounded-2xl border border-border/60 bg-background/60 p-4 sm:p-5"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-sm text-muted-foreground">
                    <span className="mb-1 block">Name</span>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-brand"
                      placeholder="Your name"
                    />
                  </label>
                  <label className="text-sm text-muted-foreground">
                    <span className="mb-1 block">Email</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-brand"
                      placeholder="you@company.com"
                    />
                  </label>
                </div>
                <label className="block text-sm text-muted-foreground">
                  <span className="mb-1 block">Company</span>
                  <input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-brand"
                    placeholder="Your company"
                  />
                </label>
                <label className="block text-sm text-muted-foreground">
                  <span className="mb-1 block">Project details</span>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-sm text-foreground outline-none ring-0 focus:border-brand"
                    placeholder="Tell us about your idea, timeline, or goals..."
                  />
                </label>
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {status === "sending" ? "Sending..." : "Send enquiry"}{" "}
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>

                {status === "sent" && (
                  <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-400">
                    ✓ Thanks — your message has been sent. We'll get back to you within 24 hours.
                  </p>
                )}
                {status === "error" && (
                  <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    ✕{" "}
                    {errorMessage ||
                      "Something went wrong — please try again or email info@techagenz.com directly."}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
