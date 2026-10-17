import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import team1 from "@/assets/team1.webp";
import team2 from "@/assets/null.png";
import team3 from "@/assets/null.png";
import team4 from "@/assets/null.png";
import team5 from "@/assets/null.png";
import team6 from "@/assets/null.png";

gsap.registerPlugin(ScrollTrigger);

type TeamMember = {
  image: string;
  title: string;
  subtitle: string;
  handle?: string;
  borderColor?: string;
  gradient?: string;
  url?: string;
  location?: string;
};

type ChromaGridProps = {
  items?: TeamMember[];
  className?: string;
  columns?: number;
  rows?: number;
};

const TEAM: TeamMember[] = [
  {
    image: team1,
    title: "Ali Haider",
    subtitle: "Founder & AI Engineer",
    borderColor: "#38BDF8",
    gradient: "linear-gradient(145deg, #38BDF8, #050B14)",
    url: "",
  },
  {
    image: team2,
    title: "Irfan Ul Haq",
    subtitle: "UI/UX Designer",
    borderColor: "#0EA5E9",
    gradient: "linear-gradient(210deg, #0EA5E9, #050B14)",
    url: "",
  },
  {
    image: team3,
    title: "Muhammad Faizan",
    subtitle: "Automation Engineer",
    borderColor: "#22D3EE",
    gradient: "linear-gradient(165deg, #22D3EE, #050B14)",
    url: "",
  },
  {
    image: team4,
    title: "Saad Arif",
    subtitle: "Product Designer",
    borderColor: "#60A5FA",
    gradient: "linear-gradient(195deg, #60A5FA, #050B14)",
    url: "",
  },
  {
    image: team5,
    title: "Laraib",
    subtitle: "Full-Stack Developer",
    borderColor: "#2563EB",
    gradient: "linear-gradient(225deg, #2563EB, #050B14)",
    url: "",
  },
  {
    image: team6,
    title: "Taha Madni",
    subtitle: "Data Scientist",
    borderColor: "#0891B2",
    gradient: "linear-gradient(135deg, #0891B2, #050B14)",
    url: "",
  },
];

export const ChromaGrid = ({
  items,
  className = "",
  columns = 3,
  rows = 2,
}: ChromaGridProps) => {
  const gridRef = useRef<HTMLDivElement | null>(null);

  const data = items?.length ? items : TEAM;

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const grid = gridRef.current;
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll<HTMLElement>(".chroma-card"));

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: grid,
        start: "top 78%",
        once: true,
        onEnter: () => {
          cards.forEach((card, i) => {
            const image = card.querySelector(".chroma-img-color");
            if (!image) return;
            const tl = gsap.timeline({ delay: i * 0.12 });
            tl.to(image, {
              opacity: 1,
              scale: 1.03,
              duration: 0.85,
              ease: "power2.out",
            }).to(image, {
                opacity: 0,
                scale: 1,
                duration: 0.55,
                ease: "power2.in",
              },
              "+=0.35",
            );
          });
        },
      });
    }, grid);

    return () => ctx.revert();
  }, []);

  const handleCardClick = (url?: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleCardEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const image = e.currentTarget.querySelector(".chroma-img-color");
    if (!image) return;
    gsap.to(image, {
      opacity: 1,
      scale: 1.03,
      duration: 0.6,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const handleCardLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const image = e.currentTarget.querySelector(".chroma-img-color");
    if (!image) return;
    gsap.to(image, {
      opacity: 0,
      scale: 1,
      duration: 0.5,
      ease: "power2.in",
      overwrite: true,
    });
  };

  return (
    <div
      ref={gridRef}
      className={`chroma-grid ${className}`}
      style={{ "--cols": columns, "--rows": rows } as React.CSSProperties}
    >
      {data.map((c, i) => (
        <article
          key={`${c.title}-${i}`}
          className="chroma-card"
          onMouseEnter={handleCardEnter}
          onMouseLeave={handleCardLeave}
          onClick={() => handleCardClick(c.url)}
          style={{
            "--card-border": c.borderColor || "transparent",
            "--card-gradient": c.gradient,
            cursor: c.url ? "pointer" : "default",
          } as React.CSSProperties}
        >
          <div className="chroma-img-wrapper">
            <img className="chroma-img-base" src={c.image} alt={c.title} loading="lazy" />
            <img className="chroma-img-color" src={c.image} alt="" aria-hidden="true" loading="lazy" />
          </div>
          <footer className="chroma-info">
            <h3 className="name">{c.title}</h3>
            <p className="role">{c.subtitle}</p>
            {c.location && <span className="location">{c.location}</span>}
          </footer>
        </article>
      ))}
    </div>
  );
};

export default function TeamSection() {
  return (
    <section className="team-section">
      <style>{`
        .team-section {
          position: relative;
          background: #050b14;
          padding: 96px 24px 112px;
          font-family: system-ui, sans-serif;
        }
        .team-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(56,189,248,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(56,189,248,0.05) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 20%, black, transparent);
          pointer-events: none;
        }
        .team-header {
          position: relative;
          max-width: 780px;
          margin: 0 auto 56px;
          text-align: center;
        }
        .team-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #38bdf8;
          font-weight: 600;
          margin-bottom: 18px;
        }
        .team-eyebrow::before {
          content: "";
          width: 22px;
          height: 1px;
          background: #38bdf8;
        }
        .team-title {
          font-size: clamp(32px, 4.2vw, 52px);
          font-weight: 800;
          line-height: 1.1;
          color: #f4f8fb;
          margin: 0 0 16px;
          letter-spacing: -0.02em;
        }
        .team-title span {
          background: linear-gradient(90deg, #7dd3fc, #38bdf8, #2563eb);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .team-sub {
          color: #8a9bb0;
          font-size: 16px;
          line-height: 1.6;
          margin: 0;
        }

        .chroma-grid {
          position: relative;
          width: 100%;
          display: grid;
          grid-template-columns: repeat(var(--cols, 3), 320px);
          grid-auto-rows: auto;
          justify-content: center;
          gap: 0.75rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem;
          box-sizing: border-box;
        }
        @media (max-width: 1124px) {
          .chroma-grid {
            grid-template-columns: repeat(auto-fit, minmax(320px, 320px));
            gap: 0.5rem;
            padding: 0.5rem;
          }
        }
        @media (max-width: 480px) {
          .chroma-grid {
            grid-template-columns: 320px;
            gap: 0.75rem;
            padding: 1rem;
          }
        }
        .chroma-card {
          position: relative;
          display: flex;
          flex-direction: column;
          width: 320px;
          height: 380px;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(148,178,205,0.18);
          background: var(--card-gradient);
        }
        .chroma-card:hover {
          border-color: var(--card-border);
        }
        .chroma-img-wrapper {
          position: relative;
          z-index: 1;
          flex: 1;
          padding: 10px;
          box-sizing: border-box;
          background: transparent;
        }
        .chroma-img-base,
        .chroma-img-color {
          position: absolute;
          inset: 10px;
          width: calc(100% - 20px);
          height: calc(100% - 20px);
          object-fit: cover;
          object-position: top;
          border-radius: 10px;
          display: block;
        }
        .chroma-img-base {
          filter: grayscale(1) brightness(0.72) contrast(1.08);
        }
        .chroma-img-color {
          filter: saturate(1.15) contrast(1.03);
          opacity: 0;
        }
        .chroma-info {
          position: relative;
          z-index: 1;
          padding: 0.75rem 1rem;
          color: #fff;
          display: grid;
          grid-template-columns: 1fr auto;
          row-gap: 0.25rem;
          column-gap: 0.75rem;
        }
        .chroma-info .role {
          color: #a9c2d6;
        }
      `}</style>

      <div className="team-header">
        <div className="team-eyebrow">The Team</div>
        <h2 className="team-title">
          The Minds <span>Engineering the Future</span>
        </h2>
        <p className="team-sub">
          Engineers, designers, and researchers building the intelligent
          systems behind every Tech Agenz deployment.
        </p>
      </div>

      <ChromaGrid items={TEAM} columns={3} rows={2} />
    </section>
  );
}