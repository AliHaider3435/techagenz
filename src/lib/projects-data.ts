import drIqbalKharal from "@/assets/dr-iqbal-kharal.webp";
import garwanLawChamber from "@/assets/garwan-law-chamber.webp";
import drSajidSohail from "@/assets/dr-sajid-sohail.webp";

export interface CaseStudyArchitectureStep {
  step: string;
  title: string;
  description: string;
}

export interface CaseStudy {
  slug: string;
  title: string; // "Project Name: What It Is, Said Plainly"
  shortTitle: string;
  formulaSummary: string; // "A [type of system] built with [tech stack] for [client type], achieving [metric 1], [metric 2], [metric 3]."
  clientType: string;
  clientName: string;
  category: "Booking Systems & Automation" | "Legal Tech" | "Healthcare";
  coverImage: string;
  tags: string[];
  featuredOnHome: boolean;
  order: number;
  timeline: string;
  status: "Live in Production";

  // Case study template sections (in exact required order)
  problem: {
    heading: string;
    description: string;
    painPoints: string[];
  };
  solution: {
    heading: string;
    description: string;
    keyDeliverables: string[];
  };
  stack: string[];
  architecture: {
    overview: string;
    flowSteps: CaseStudyArchitectureStep[];
  };
  results: {
    stats: Array<{ metric: string; label: string; context: string }>;
    bullets: string[];
  };
  keyFeatures: Array<{
    title: string;
    description: string;
    tag?: string;
  }>;
  testimonial?: {
    quote: string;
    author: string;
    role: string;
    organization: string;
  };
}

export const projectCategories = [
  "All",
  "Booking Systems & Automation",
  "Legal Tech",
  "Healthcare",
] as const;

export const projects: CaseStudy[] = [
  {
    slug: "dr-iqbal-kharal",
    title: "Dr. Iqbal Ahmad Kharal: Real-Time Patient Scheduling & Queue Management System",
    shortTitle: "Dr. Iqbal Ahmad Kharal Booking System",
    formulaSummary:
      "A real-time appointment booking and queue management system built with React, Node.js, and WhatsApp Cloud API for Dr. Iqbal Ahmad Kharal's specialist clinic, achieving a 42% decrease in waiting room congestion, zero double-booking incidents, and saving 25+ hours of front-desk scheduling work per week.",
    clientType: "Specialist Clinical Practice",
    clientName: "Dr. Iqbal Ahmad Kharal Clinic",
    category: "Booking Systems & Automation",
    coverImage: drIqbalKharal,
    tags: ["WhatsApp Cloud API", "Patient Queue", "Node.js", "PostgreSQL", "Docker"],
    featuredOnHome: true,
    order: 1,
    timeline: "Live in Production",
    status: "Live in Production",
    problem: {
      heading: "Waiting Room Congestion & Manual Reception Overload",
      description:
        "Handling up to 80 daily consultations through phone calls and physical reception desk registers created severe waiting room congestion. Patients frequently waited 2 to 3 hours past their estimated time. Double-bookings during surge hours frustrated patients, and clinic staff had no automated way to notify patients when appointments were delayed due to emergency procedures.",
      painPoints: [
        "Receptionists overwhelmed with non-stop phone calls coordinating daily consultation slots",
        "Patients waiting 2 to 3 hours beyond their estimated appointment times",
        "Paper registers causing accidental double-bookings during peak clinical hours",
        "No automated notifications when emergency hospital surgeries delayed the clinic schedule",
      ],
    },
    solution: {
      heading: "Atomic Slot Allocation & Real-Time Queue Monitoring",
      description:
        "Tech Agenz engineered a high-concurrency patient appointment booking platform. We implemented atomic slot reservation to eliminate double bookings, a mobile-first appointment booking interface requiring zero app installation, and automated WhatsApp/SMS webhooks that confirm booking details. The doctor's administrative dashboard gives immediate control over session capacity, emergency slot freezes, and real-time patient queue monitoring.",
      keyDeliverables: [
        "Mobile-first patient self-booking workflow with zero app download required",
        "Atomic database slot reservation completely preventing conflicting bookings",
        "Automated WhatsApp/SMS alerts for appointment confirmations and time reminders",
        "Doctor and reception control dashboard for queue monitoring and emergency session freezes",
      ],
    },
    stack: ["React", "Node.js", "PostgreSQL", "Calendar Webhooks", "WhatsApp Cloud API", "Docker"],
    architecture: {
      overview:
        "Patients reserve slots through a mobile-optimized portal or WhatsApp webhook. The system validates slot availability against PostgreSQL with atomic row-level locks, transmits instant confirmation alerts, and logs the patient into the clinic's real-time queue monitor.",
      flowSteps: [
        {
          step: "01",
          title: "Slot Selection",
          description: "Patient selects available consultation slot from real-time calendar.",
        },
        {
          step: "02",
          title: "Atomic Lock & Reservation",
          description: "Database enforces row-level locking to prevent concurrent booking conflicts.",
        },
        {
          step: "03",
          title: "Automated WhatsApp Confirmation",
          description: "Instant booking confirmation and token number dispatched to patient's phone.",
        },
        {
          step: "04",
          title: "Live Queue Dashboard",
          description: "Clinic receptionist tracks check-ins and physician views live consultation queue.",
        },
      ],
    },
    results: {
      stats: [
        { metric: "42%", label: "Wait Time Reduction", context: "Decrease in waiting room overcrowding" },
        { metric: "0", label: "Double Bookings", context: "Atomic database locking eliminated all collisions" },
        { metric: "70%+", label: "Phone Load Reduced", context: "Staff inquiry workload dropped during peak hours" },
        { metric: "25+ hrs", label: "Weekly Time Saved", context: "Staff hours redirected from calls to in-clinic care" },
      ],
      bullets: [
        "42% decrease in physical waiting room overcrowding and patient wait times",
        "Near-zero missed appointments via automated WhatsApp/SMS reminders",
        "Atomic database locking eliminating double-booking incidents completely",
        "Staff phone inquiry workload reduced by over 70% during peak clinical hours",
      ],
    },
    keyFeatures: [
      {
        title: "Atomic Slot Reservation",
        description: "PostgreSQL row-level isolation preventing two patients from booking the same slot.",
        tag: "Data Integrity",
      },
      {
        title: "Automated WhatsApp/SMS Alerts",
        description: "Immediate token confirmation, location directions, and 2-hour pre-visit reminders.",
        tag: "Notifications",
      },
      {
        title: "Physician Control Console",
        description: "Real-time queue tracking, one-tap emergency freezes, and daily consultation counters.",
        tag: "Clinic Dashboard",
      },
      {
        title: "Mobile-First Patient UI",
        description: "Accessible to patients of all ages on any smartphone without downloading an app.",
        tag: "Patient Experience",
      },
    ],
    testimonial: {
      quote:
        "The automated booking system transformed our daily clinic flow. Waiting room congestion dropped dramatically, and patients arrive on time with their token numbers in hand.",
      author: "Clinical Administrator",
      role: "Operations Lead",
      organization: "Dr. Iqbal Ahmad Kharal Clinic",
    },
  },
  {
    slug: "garwan-law-chamber",
    title: "Garwan Law Chamber: Modernizing Legal Intake & Attorney Portals",
    shortTitle: "Garwan Law Chamber Practice Portal",
    formulaSummary:
      "An authoritative digital legal practice portal built with React 19, TypeScript, and PostgreSQL for Garwan Law Chamber, achieving an 85% reduction in initial consultation administrative scheduling time, sub-second load times, and confidential upfront case brief management.",
    clientType: "Corporate & Civil Law Practice",
    clientName: "Garwan Law Chamber",
    category: "Legal Tech",
    coverImage: garwanLawChamber,
    tags: ["React 19", "TypeScript", "Tailwind CSS", "PostgreSQL", "Legal Tech"],
    featuredOnHome: true,
    order: 2,
    timeline: "Live in Production",
    status: "Live in Production",
    problem: {
      heading: "Unstructured Case Inquiries & Manual Advocate Coordination",
      description:
        "Garwan Law Chamber handled high-stakes civil and corporate inquiries primarily through informal messaging and walk-ins. Prospective clients lacked a unified platform to review practice credentials, verify attorney jurisdictions, and submit confidential case briefs. Administrative staff spent hours daily sorting unvetted inquiries and coordinating lawyer schedules manually.",
      painPoints: [
        "Prospective litigants submitted incomplete case details, wasting senior attorney consultation time",
        "Staff manually coordinated schedules across multiple advocates via phone and messaging",
        "No centralized digital directory showcasing practice area expertise and jurisdictional credentials",
        "International and corporate clients lacked a seamless consultation scheduling channel",
      ],
    },
    solution: {
      heading: "Structured Case Intake & Advocate Consultation Management",
      description:
        "Tech Agenz designed and engineered a bespoke, secure legal technology portal tailored to the chamber's practice hierarchy. The platform incorporates structured case intake forms with preliminary fact gathering, automated appointment booking synced to advocate calendars, and authoritative practice directories that present credentials with institutional prestige. Deployed on modern server-rendered infrastructure with sub-second page loads and strict privacy protocols.",
      keyDeliverables: [
        "Structured digital intake questionnaires capturing jurisdiction and essential facts prior to meetings",
        "Advocate consultation booking synced to attorney calendars to eliminate scheduling conflicts",
        "Authoritative practice directory outlining Corporate, Civil, Constitutional, and Appellate practice areas",
        "High-performance responsive portal with sub-second page loads and strict privacy protection",
      ],
    },
    stack: ["React 19", "TypeScript", "Tailwind CSS", "Next.js / Node.js", "PostgreSQL", "REST API"],
    architecture: {
      overview:
        "Server-rendered architecture built with React 19, TypeScript, and PostgreSQL. Client inquiry payloads are validated, structured, and securely delivered to the chamber's administrative portal with calendar synchronization.",
      flowSteps: [
        {
          step: "01",
          title: "Client Intake Submission",
          description: "Prospective litigant selects legal domain and submits case details.",
        },
        {
          step: "02",
          title: "Advocate Availability Check",
          description: "System verifies advocate availability and avoids scheduling overlaps.",
        },
        {
          step: "03",
          title: "Confidential Case Brief",
          description: "Case summary organized into attorney calendar with preliminary facts.",
        },
        {
          step: "04",
          title: "Consultation Confirmation",
          description: "Client receives scheduled consultation details and conference instructions.",
        },
      ],
    },
    results: {
      stats: [
        { metric: "85%", label: "Scheduling Time Saved", context: "Reduction in initial consultation administrative coordination" },
        { metric: "<0.8s", label: "Page Load Time", context: "Sub-second speed on mobile and desktop devices" },
        { metric: "100%", label: "Confidential Intake", context: "Secure upfront briefs preserving legal privilege" },
        { metric: "300+", label: "Monthly Inquiries", context: "Handled through structured digital intake" },
      ],
      bullets: [
        "85% reduction in initial consultation administrative scheduling time",
        "Confidential upfront case intake capturing critical jurisdiction details",
        "Significant increase in corporate client conversion from international and local referrals",
        "Sub-second load times and 100% mobile responsive experience for prospective litigants",
      ],
    },
    keyFeatures: [
      {
        title: "Confidential Case Intake Form",
        description: "Captures jurisdiction, opposing parties, and factual background prior to first meeting.",
        tag: "Intake Workflow",
      },
      {
        title: "Advocate Calendar Sync",
        description: "Prevents double-bookings and organizes attorney schedules automatically.",
        tag: "Calendar",
      },
      {
        title: "Institutional Practice Directory",
        description: "Presents credentials and past litigation experience with institutional prestige.",
        tag: "Branding",
      },
      {
        title: "Mobile-Optimized Security",
        description: "Encrypted data transmission and responsive layout on all devices.",
        tag: "Security",
      },
    ],
    testimonial: {
      quote:
        "The portal gave our law chamber a modern, authoritative digital presence. Initial consultation intake is now structured and efficient, saving our advocates valuable time.",
      author: "Senior Advocate",
      role: "Partner",
      organization: "Garwan Law Chamber",
    },
  },
  {
    slug: "dr-sajid-sohail",
    title: "Dr. Sajid Sohail: High-Volume Clinic Operations & Patient Consultation Portal",
    shortTitle: "Dr. Sajid Sohail Clinic Portal",
    formulaSummary:
      "A responsive patient booking and clinical consultation workflow system built with React 19, TypeScript, and PostgreSQL for Dr. Sajid Sohail at Rahmania Medical Center, achieving a <5% patient no-show rate, saving 4 minutes per consultation intake, and increasing monthly consultations by 35%.",
    clientType: "Hospital & Medical Center Healthcare",
    clientName: "Dr. Sajid Sohail (Rahmania Medical Center)",
    category: "Healthcare",
    coverImage: drSajidSohail,
    tags: ["React 19", "TypeScript", "Node.js", "PostgreSQL", "Healthcare"],
    featuredOnHome: true,
    order: 3,
    timeline: "Live in Production",
    status: "Live in Production",
    problem: {
      heading: "Hospital Quota Coordination & Manual Intake Bottlenecks",
      description:
        "Operating within Rahmania Medical Center, Dr. Sajid Sohail required a specialized digital workflow that coordinated seamlessly between hospital reception, patient inquiries, and daily consultation quotas. Relying on paper charts and phone calls led to scheduling gaps, manual errors in patient record intake, and high no-show rates during bad weather or hospital emergencies.",
      painPoints: [
        "Manual paper intake taking 4 to 5 minutes of doctor consultation time per patient",
        "Scheduling gaps and no-show rates reaching 15% due to lack of automated reminders",
        "Lack of coordination between central hospital reception desk and doctor examination room",
        "Difficulty rapidly retrieving previous prescription and consultation history",
      ],
    },
    solution: {
      heading: "Dynamic 15-Minute Slot Allocation & Pre-Consultation Questionnaires",
      description:
        "We built a tailored medical portal with 15-minute slot allocation, intelligent patient symptom intake questionnaires, and automated clinic confirmation notifications. The system features a doctor control panel to view expected patient volumes, mark completed consultations, and seamlessly reschedule appointments with one click. Hospital staff access a dedicated receptionist view to manage check-ins instantly.",
      keyDeliverables: [
        "15-minute slot allocation algorithm tailored to daily hospital consultation quotas",
        "Pre-filled digital symptom intake questionnaires submitted prior to patient arrival",
        "Doctor control console with 1-click consultation completion and history lookup",
        "Dedicated receptionist view for check-ins, queue management, and quota pacing",
      ],
    },
    stack: ["React 19", "TypeScript", "Tailwind CSS", "Node.js", "Express", "PostgreSQL"],
    architecture: {
      overview:
        "Lightweight, sub-second web architecture connecting patient booking with the doctor's consultation desk and hospital reception. Intake data is cached and synchronized in real time.",
      flowSteps: [
        {
          step: "01",
          title: "15-Minute Slot Booking",
          description: "Patient reserves consultation slot according to daily session capacity.",
        },
        {
          step: "02",
          title: "Digital Symptom Intake",
          description: "Patient completes brief symptom questionnaire before consultation.",
        },
        {
          step: "03",
          title: "Reception Check-In",
          description: "Hospital receptionist marks patient arrival with one click.",
        },
        {
          step: "04",
          title: "Doctor Consultation View",
          description: "Doctor accesses pre-filled brief and records follow-up instructions.",
        },
      ],
    },
    results: {
      stats: [
        { metric: "<5%", label: "Patient No-Show Rate", context: "Down from 15% via automated pre-visit reminders" },
        { metric: "4 Mins", label: "Saved Per Consultation", context: "Pre-filled medical intake saves doctor time" },
        { metric: "35%", label: "Consultation Growth", context: "Increase in verified monthly patient consultations" },
        { metric: "<1 sec", label: "Record Retrieval", context: "Instantaneous access to appointment history" },
      ],
      bullets: [
        "35% increase in verified monthly patient consultations through automated scheduling",
        "No-show rate dropped to under 5% following automated pre-consultation reminders",
        "Pre-filled medical intake questionnaires saving 4 minutes per doctor consultation",
        "Integrated patient ledger and appointment history accessible in under 1 second",
      ],
    },
    keyFeatures: [
      {
        title: "15-Minute Slot Allocation",
        description: "Optimized consultation pacing preventing waiting room overcrowding.",
        tag: "Scheduling",
      },
      {
        title: "Symptom Intake Questionnaire",
        description: "Pre-fills essential patient history before the doctor consultation begins.",
        tag: "Clinical Efficiency",
      },
      {
        title: "Hospital Receptionist Sync",
        description: "Seamless coordination between hospital reception and physician room.",
        tag: "Collaboration",
      },
      {
        title: "Instant History Lookup",
        description: "Look up previous consultation notes and prescriptions in under 1 second.",
        tag: "Records",
      },
    ],
    testimonial: {
      quote:
        "The digital consultation workflow transformed our clinic. The 15-minute slot allocation keeps us on schedule, and pre-filled symptom questionnaires save valuable doctor time with every patient.",
      author: "Clinical Practice Manager",
      role: "Operations Coordinator",
      organization: "Rahmania Medical Center",
    },
  },
];

export function getAllProjects(): CaseStudy[] {
  return projects;
}

export function getFeaturedProjects(): CaseStudy[] {
  return projects;
}

export function getProjectBySlug(slug: string): CaseStudy | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getRelatedProjects(slug: string, limit = 2): CaseStudy[] {
  return projects.filter((p) => p.slug !== slug).slice(0, limit);
}
