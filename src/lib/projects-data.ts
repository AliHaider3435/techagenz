import drIqbalKharal from "@/assets/dr-iqbal-kharal.webp";
import garwanLawChamber from "@/assets/garwan-law-chamber.webp";
import drSajidSohail from "@/assets/dr-sajid-sohail.webp";
import workDev from "@/assets/work-dev.webp";
import workSaas from "@/assets/work-saas.webp";
import workData from "@/assets/work-data.webp";

export interface CaseStudyArchitectureStep {
  step: string;
  title: string;
  description: string;
}

export type ProjectCategory =
  | "All"
  | "Booking Systems & Automation"
  | "Legal Tech"
  | "Healthcare"
  | "AI & Enterprise Automation"
  | "Cloud & Web Applications";

export interface CaseStudy {
  slug: string;
  title: string; // "Project Name: What It Is, Said Plainly"
  shortTitle: string;
  formulaSummary: string; // "A [type of system] built with [tech stack] for [client type], achieving [metric 1], [metric 2], [metric 3]."
  clientType: string;
  clientName: string;
  category: "Booking Systems & Automation" | "Legal Tech" | "Healthcare" | "AI & Enterprise Automation" | "Cloud & Web Applications";
  coverImage: string;
  tags: string[];
  featuredOnHome: boolean;
  order: number;
  timeline: string;
  status: "Live in Production";

  // Case study template sections
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
  "AI & Enterprise Automation",
  "Cloud & Web Applications",
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
        "Out of everyone who I got quotes from, they were the first ones to go, 'Hey, let's develop a proof of concept for you.' ... They are very, very professional. I'll go for them again.",
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
  {
    slug: "chottay-ai-voice",
    title: "Chottay: AI Voice Order-Taking System for Small Restaurants",
    shortTitle: "Chottay: AI Voice Order-Taking System",
    formulaSummary:
      "An automated multilingual voice order-taking AI built with WebRTC, Whisper, and FastAPI, enabling small restaurants to handle 20+ concurrent phone orders with 98% accuracy and zero missed revenue during rush hours.",
    clientType: "Hospitality & Food Service",
    clientName: "Chottay Food Services",
    category: "AI & Enterprise Automation",
    coverImage: workDev,
    tags: ["Voice AI", "Whisper", "FastAPI", "WebRTC", "Python"],
    featuredOnHome: true,
    order: 4,
    timeline: "Live in Production",
    status: "Live in Production",
    problem: {
      heading: "Missed Phone Orders & Order-Taking Chaos During Peak Hours",
      description: "Small restaurants lose up to 30% of takeaway revenue during peak dinner hours because staff cannot answer multiple simultaneous ringing phone lines while preparing food.",
      painPoints: ["Unanswered calls during rush hours", "Incorrect orders due to kitchen background noise", "Staff stress handling phone calls and cooking simultaneously"],
    },
    solution: {
      heading: "Low-Latency Multilingual Conversational Voice Agent",
      description: "Built a customized voice agent that answers telephone calls immediately, takes complex food customizations accurately in conversational Urdu/English, and prints tickets directly to kitchen thermal printers.",
      keyDeliverables: ["Zero-wait instant answering on up to 50 concurrent lines", "Direct POS and thermal kitchen printer integration", "Order confirmation SMS sent to caller instantly"],
    },
    stack: ["Python", "FastAPI", "Whisper", "Twilio SIP", "PostgreSQL"],
    architecture: {
      overview: "Twilio telephony routes inbound audio through WebSockets to a streaming Whisper model, parsed by an LLM with menu context, and dispatched to kitchen order printers.",
      flowSteps: [
        { step: "01", title: "Inbound Call", description: "Call answered in under 200ms." },
        { step: "02", title: "Voice Transcription", description: "Real-time acoustic model processes customer speech." },
        { step: "03", title: "Order Parsing", description: "Intent engine extracts items, quantities, and customizations." },
        { step: "04", title: "Kitchen Dispatch", description: "Automated ticket printed and confirmation SMS dispatched." },
      ],
    },
    results: {
      stats: [
        { metric: "100%", label: "Calls Answered", context: "Zero missed customer calls during rush hours" },
        { metric: "98.4%", label: "Order Accuracy", context: "Precise item customization transcription" },
        { metric: "3.2x", label: "Peak Revenue", context: "Increase in phone orders during weekend dinner surges" },
      ],
      bullets: ["Eliminated missed orders entirely", "Reduced kitchen order entry errors by 90%", "Saved restaurant owners over 40 hours per month in manual call taking"],
    },
    keyFeatures: [
      { title: "Voice Dialect Handling", description: "Trained on regional accents and local colloquialisms." },
      { title: "Direct POS Integration", description: "Injects orders directly into POS databases." },
    ],
  },
  {
    slug: "medtech-elevate",
    title: "MedTech Elevate: AI-Powered Medical Device Lifecycle Platform",
    shortTitle: "MedTech Elevate: AI Medical Device Lifecycle",
    formulaSummary:
      "An FDA-ready medical hardware telemetry and calibration tracker built with Next.js, Go, and TimescaleDB, serving 40+ clinical engineering departments with 99.99% sensor uptime.",
    clientType: "Biomedical Engineering & Clinics",
    clientName: "MedTech Global Solutions",
    category: "Healthcare",
    coverImage: workSaas,
    tags: ["Go", "TimescaleDB", "React 19", "IoT Telemetry", "Docker"],
    featuredOnHome: true,
    order: 5,
    timeline: "Live in Production",
    status: "Live in Production",
    problem: {
      heading: "Critical Medical Device Maintenance Drift & Compliance Failures",
      description: "Hospitals track thousands of diagnostic machines across facilities manually, leading to missed calibration schedules, regulatory penalties, and unexpected device downtime.",
      painPoints: ["Manual spreadsheets tracking calibration", "Sudden equipment downtime during surgical procedures", "Compliance audit failure risks"],
    },
    solution: {
      heading: "Automated IoT Telemetry & Predictive Calibration Platform",
      description: "Deployed automated telemetry ingestion pipelines collecting operating metrics every 10 seconds, alerting clinical staff before drift tolerances are exceeded.",
      keyDeliverables: ["Real-time sensor telemetry dashboards", "Automated calibration alerts with digital audit logs", "Predictive maintenance algorithms"],
    },
    stack: ["Go", "Next.js", "TimescaleDB", "Kafka", "Grafana"],
    architecture: {
      overview: "Edge gateways publish device diagnostics over MQTT to Kafka queues, aggregated in TimescaleDB with instant alerting rules.",
      flowSteps: [
        { step: "01", title: "Edge Telemetry", description: "Machine sensors broadcast diagnostic telemetry." },
        { step: "02", title: "Stream Processing", description: "High-throughput message pipeline verifies data ranges." },
        { step: "03", title: "Drift Detection", description: "Algorithms flag anomalous voltage and calibration variance." },
        { step: "04", title: "Automated Work Order", description: "Technician work order generated immediately." },
      ],
    },
    results: {
      stats: [
        { metric: "99.99%", label: "Sensor Uptime", context: "Continuous real-time clinical monitoring" },
        { metric: "60%", label: "Less Downtime", context: "Predictive maintenance prevented sudden breakdowns" },
        { metric: "100%", label: "Audit Readiness", context: "Automated ISO & regulatory compliance documentation" },
      ],
      bullets: ["Prevented costly emergency device repairs", "Streamlined annual hospital equipment audits to under 1 hour", "Saved clinical teams hundreds of hours of manual logging"],
    },
    keyFeatures: [
      { title: "Predictive Anomaly Engine", description: "Detects motor and sensor drift days before failure." },
      { title: "Compliance Audit Trail", description: "Cryptographically verifiable timestamped calibration logs." },
    ],
  },
  {
    slug: "bidmate-chrome-extension",
    title: "BidMate: AI Proposal Generator Chrome Extension for Freelancers",
    shortTitle: "BidMate: AI Proposal Generator Chrome Extension",
    formulaSummary:
      "A context-aware AI browser extension built with React, Manifest V3, and Gemini 2.0 Flash, delivering tailor-made client proposals in under 15 seconds with a 3.4x boost in interview rates.",
    clientType: "Freelancers & Digital Agencies",
    clientName: "BidMate Software",
    category: "AI & Enterprise Automation",
    coverImage: workData,
    tags: ["Chrome Extension", "Manifest V3", "TypeScript", "LLM Orchestration"],
    featuredOnHome: true,
    order: 6,
    timeline: "Live in Production",
    status: "Live in Production",
    problem: {
      heading: "Proposal Writing Fatigue & Low Client Response Rates",
      description: "Agencies and freelancers spend 4+ hours every day writing personalized proposals for job postings, only to receive generic template responses or suffer bidding fatigue.",
      painPoints: ["Hours spent copying and pasting cover letters", "Low client response rates due to robotic generic phrasing", "Slow response times losing out to earlier applicants"],
    },
    solution: {
      heading: "Instant Context-Aware Proposal Synthesizer",
      description: "Built a sleek browser extension that reads job descriptions directly from the DOM, cross-references the freelancer's portfolio, and drafts persuasive, tailored proposals in seconds.",
      keyDeliverables: ["1-click proposal generation inside Upwork and LinkedIn", "Portfolio case study smart matching", "Custom tone and pricing suggestion sliders"],
    },
    stack: ["TypeScript", "React", "Chrome Extension MV3", "Gemini API", "Tailwind CSS"],
    architecture: {
      overview: "Extension content script extracts post parameters, securely queries cloud LLM orchestrators with profile embeddings, and injects personalized proposals into the application text area.",
      flowSteps: [
        { step: "01", title: "DOM Extraction", description: "Extracts client problem statement and requirements." },
        { step: "02", title: "Portfolio Semantic Search", description: "Matches candidate's most relevant completed projects." },
        { step: "03", title: "Proposal Generation", description: "Synthesizes personalized pitch addressing key pain points." },
        { step: "04", title: "One-Click Injection", description: "Populates the proposal form ready for client review." },
      ],
    },
    results: {
      stats: [
        { metric: "15s", label: "Average Draft Time", context: "Down from 25 minutes per proposal" },
        { metric: "3.4x", label: "Interview Rate", context: "Improvement in client callback conversions" },
        { metric: "10,000+", label: "Proposals Generated", context: "Generated across global freelance platforms" },
      ],
      bullets: ["Reduced daily business development time from 4 hours to 30 minutes", "Increased client reply rate by 240%", "Empowered solo developers to scale their outreach effortlessly"],
    },
    keyFeatures: [
      { title: "Direct In-Page Integration", description: "Zero copy-pasting between external AI tabs and the browser." },
      { title: "Client Pain Point Extractor", description: "Pinpoints exactly what the hiring manager cares about." },
    ],
  },
  {
    slug: "workspace-iot-twin",
    title: "WorkSpace: Office IoT Digital Twin & Smart Building Facility Management",
    shortTitle: "WorkSpace: Office IoT Digital Twin & Smart Building",
    formulaSummary:
      "A real-time 3D digital twin of corporate headquarters built with Three.js, WebSockets, and Node.js, slashing commercial energy waste by 31% across 120,000 sq ft of corporate space.",
    clientType: "Commercial Real Estate & Corporate",
    clientName: "Apex Corporate Towers",
    category: "Cloud & Web Applications",
    coverImage: workDev,
    tags: ["Three.js", "WebSockets", "IoT", "WebGL", "React 19"],
    featuredOnHome: true,
    order: 7,
    timeline: "Live in Production",
    status: "Live in Production",
    problem: {
      heading: "Excessive Commercial HVAC Energy Bills & Space Inefficiencies",
      description: "Managing cooling, lighting, and desk occupancy across multi-floor corporate buildings relied on manual schedules, resulting in cooling empty conference rooms and wasted electricity.",
      painPoints: ["Massive energy bills cooling vacant rooms", "Zero visibility into actual desk and meeting room utilization", "Manual HVAC thermostat adjustments by facility managers"],
    },
    solution: {
      heading: "Interactive 3D Digital Twin with Automated Climate Relays",
      description: "Rendered a photorealistic interactive 3D model of the office building in the browser, showing live temperature heatmaps, occupancy sensors, and automated smart breaker controls.",
      keyDeliverables: ["Browser-based 60fps WebGL digital twin", "Live heatmaps and room occupancy visualization", "Automated smart schedule rules tied to meeting room calendars"],
    },
    stack: ["Three.js", "WebGL", "Node.js", "MQTT", "PostgreSQL", "React"],
    architecture: {
      overview: "Building sensor data streams via MQTT to a central telemetry server, rendered as live thermal and occupancy overlays onto a Three.js building mesh.",
      flowSteps: [
        { step: "01", title: "Sensor Capture", description: "Desk and ambient sensors capture live room state." },
        { step: "02", title: "Mesh Rendering", description: "3D scene updates real-time shader colors based on room occupancy." },
        { step: "03", title: "Automated Control", description: "Idle rooms automatically trigger eco HVAC modes after 10 mins." },
        { step: "04", title: "Analytics Report", description: "Facility directors receive space optimization heatmaps." },
      ],
    },
    results: {
      stats: [
        { metric: "31%", label: "Energy Cut", context: "Reduction in monthly HVAC commercial electricity bills" },
        { metric: "60fps", label: "Render Rate", context: "Smooth hardware-accelerated 3D browser model" },
        { metric: "120k", label: "Sq Ft Monitored", context: "Across 4 corporate floors with sub-second sync" },
      ],
      bullets: ["Saved $4,200+ per month on commercial power bills", "Optimized desk allocation eliminating need to rent additional floor space", "Full mobile touch control for facility maintenance engineers"],
    },
    keyFeatures: [
      { title: "Live Heatmap Shader", description: "Real-time temperature gradient visualization across all zones." },
      { title: "One-Click Zone Freeze", description: "Instantly power down entire unoccupied sections during holidays." },
    ],
  },
  {
    slug: "voice-to-vision",
    title: "Voice to Vision: Generative AI Text-to-Video Content Platform",
    shortTitle: "Voice to Vision: Generative AI Text-to-Video",
    formulaSummary:
      "An automated text-to-video production pipeline built with Next.js, FFmpeg, and Python, generating 500+ branded social video assets per day with 90% cost savings over manual editing.",
    clientType: "Media Companies & Marketing Agencies",
    clientName: "StoryWave Media",
    category: "AI & Enterprise Automation",
    coverImage: workSaas,
    tags: ["FFmpeg", "Generative AI", "Python", "React", "Video Pipeline"],
    featuredOnHome: true,
    order: 8,
    timeline: "Live in Production",
    status: "Live in Production",
    problem: {
      heading: "Prohibitive Video Production Costs & Slow Turnaround Times",
      description: "Agencies need hundreds of short-form videos for social campaigns, but manual video editing teams take 24-48 hours per video and cost thousands in post-production fees.",
      painPoints: ["Slow turnarounds missing trending topics", "High agency production overheads", "Inconsistent brand typography across freelancer edits"],
    },
    solution: {
      heading: "End-to-End Headless Video Generation Engine",
      description: "Built a headless render pipeline that accepts blog posts or scripts, selects licensed video clips, overlays dynamic animated captions, generates voiceovers, and renders MP4s in minutes.",
      keyDeliverables: ["Script-to-video compilation in under 3 minutes", "Dynamic word-by-word animated subtitles", "Automatic vertical/horizontal aspect ratio repurposing"],
    },
    stack: ["Python", "FFmpeg", "Next.js", "ElevenLabs API", "Redis Queue"],
    architecture: {
      overview: "Queue-backed microservices generate audio, align timestamps, stitch media chunks with FFmpeg GPU acceleration, and publish rendered videos to cloud storage.",
      flowSteps: [
        { step: "01", title: "Script Input", description: "User pastes script or blog URL into generator." },
        { step: "02", title: "Audio & Timestamping", description: "Ultra-realistic voiceover generated with millisecond word timestamps." },
        { step: "03", title: "GPU Video Stitching", description: "FFmpeg renders transitions, dynamic subtitles, and background audio." },
        { step: "04", title: "Cloud Export", description: "High-definition MP4 uploaded ready for social publishing." },
      ],
    },
    results: {
      stats: [
        { metric: "<3 min", label: "Render Time", context: "From raw script to 4K social media video" },
        { metric: "90%", label: "Cost Savings", context: "Compared to traditional human video editing services" },
        { metric: "500+", label: "Videos / Day", context: "Processed concurrently across distributed cloud workers" },
      ],
      bullets: ["Scale video marketing output by 10x without hiring additional editors", "Automated multilingual subtitle translation for international audiences", "100% brand consistency across fonts, colors, and audio tracks"],
    },
    keyFeatures: [
      { title: "Dynamic Word-by-Word Captions", description: "Trending TikTok-style highlighted subtitle animations." },
      { title: "Multi-Format Export", description: "Render 9:16 vertical and 16:9 widescreen formats simultaneously." },
    ],
  },
  {
    slug: "elegant-mobility",
    title: "Elegant Mobility: Premium Luxury Transportation Booking Engine",
    shortTitle: "Elegant Mobility: Premium Luxury Transportation",
    formulaSummary:
      "A high-end chauffeur reservation and fleet dispatch platform built with React 19, Stripe Connect, and Mapbox, achieving sub-second fare estimation and zero booking collision.",
    clientType: "Executive Travel & Chauffeur Services",
    clientName: "Elegant Mobility VIP",
    category: "Booking Systems & Automation",
    coverImage: workData,
    tags: ["React 19", "Mapbox", "Stripe Connect", "Node.js", "Real-Time GPS"],
    featuredOnHome: true,
    order: 9,
    timeline: "Live in Production",
    status: "Live in Production",
    problem: {
      heading: "Chaotic VIP Booking Coordination & Flight Delay Handling",
      description: "Managing private luxury vehicle fleets for executives via phone and email led to miscommunicated flight arrival times, double-booked limousines, and awkward payment friction.",
      painPoints: ["Flight delays stranding executive passengers", "Manual credit card processing causing billing delays", "No live vehicle tracking for awaiting clients"],
    },
    solution: {
      heading: "Automated Flight-Tracking Chauffeur Dispatch System",
      description: "Engineered an executive booking platform with live airport flight status API synchronization, dynamic distance-based pricing, and instantaneous SMS chauffeur arrival alerts.",
      keyDeliverables: ["Real-time FAA flight delay schedule auto-adjustment", "Seamless Stripe Connect instant deposit billing", "Live vehicle tracking with client VIP privacy controls"],
    },
    stack: ["React 19", "Node.js", "Mapbox GL", "Stripe Connect", "PostgreSQL"],
    architecture: {
      overview: "Passenger reserves vehicle with flight number. Webhooks track flight status in real time and automatically adjust chauffeur dispatch schedules when flights are delayed.",
      flowSteps: [
        { step: "01", title: "Reservation & Flight Tag", description: "Passenger enters flight number and luxury vehicle class." },
        { step: "02", title: "Live Flight Tracking", description: "System listens to flight radar webhooks for arrival time changes." },
        { step: "03", title: "Chauffeur Dispatch", description: "Driver notified at optimal window based on traffic and landing time." },
        { step: "04", title: "Curbside Meet & Greet", description: "Client receives driver phone link and vehicle details on touchdown." },
      ],
    },
    results: {
      stats: [
        { metric: "100%", label: "On-Time Pickups", context: "Even with severe unexpected airline flight delays" },
        { metric: "4.9/5", label: "VIP Client Rating", context: "Across thousands of corporate executive journeys" },
        { metric: "0", label: "Dispatch Conflicts", context: "Automated schedule buffers prevented double-bookings" },
      ],
      bullets: ["Zero missed pickups due to automated flight tracking", "Automated corporate expense invoicing sent to assistants instantly", "Increased repeat bookings by 65% with saved client preference profiles"],
    },
    keyFeatures: [
      { title: "Live Flight Radar Integration", description: "Automatically adjusts pickup times when flights arrive early or late." },
      { title: "One-Click Corporate Billing", description: "Direct billing to executive corporate expense accounts." },
    ],
  },
  {
    slug: "digital-harmony",
    title: "Digital Harmony: Unified School Management & Enrollment Portal",
    shortTitle: "Digital Harmony: Unified School Management",
    formulaSummary:
      "A complete K-12 institutional portal built with React 19, TypeScript, and PostgreSQL, digitizing 2,500+ student records, parent tuition fee collection, and grade reports.",
    clientType: "Educational Institutions & Academies",
    clientName: "Harmony International Academy",
    category: "Cloud & Web Applications",
    coverImage: workDev,
    tags: ["React 19", "PostgreSQL", "TypeScript", "PDF Generation", "Tuition Portal"],
    featuredOnHome: true,
    order: 10,
    timeline: "Live in Production",
    status: "Live in Production",
    problem: {
      heading: "Paper-Heavy Student Records & Uncollected Tuition Fee Chaos",
      description: "Managing student fee vouchers, attendance rolls, and term report cards across 2,500 students with paper registers created administrative bottlenecks and revenue leakage.",
      painPoints: ["Lost fee receipts and unpaid tuition reconciliation delays", "Teachers spending 10+ hours per term calculating grade cards manually", "Parents lacking a direct digital line for homework updates and fee payments"],
    },
    solution: {
      heading: "Centralized School ERP with 1-Click Fee Reconciliation",
      description: "Engineered a secure multi-role portal for administration, teachers, and parents with automated tuition voucher generation, 1-click digital grade reports, and instant attendance SMS.",
      keyDeliverables: ["Bank-integrated online tuition fee gateway", "Automated PDF term report card generator", "Daily attendance tracking with instant parent SMS alerts"],
    },
    stack: ["React 19", "TypeScript", "PostgreSQL", "Node.js", "Tailwind CSS"],
    architecture: {
      overview: "Role-based access system isolating student grades, finance records, and parent profiles with strict compliance and cryptographic data backup.",
      flowSteps: [
        { step: "01", title: "Daily Attendance", description: "Teacher taps attendance on classroom tablet in under 60 seconds." },
        { step: "02", title: "Parent Notification", description: "Absences trigger automated WhatsApp/SMS alerts to parents." },
        { step: "03", title: "Online Fee Payment", description: "Parents view invoice and pay tuition through integrated bank portal." },
        { step: "04", title: "Term Grade Processing", description: "Exams calculate automatically and produce downloadable report cards." },
      ],
    },
    results: {
      stats: [
        { metric: "99.2%", label: "Fee Collection", context: "On-time tuition payments up from 74%" },
        { metric: "15 hrs", label: "Teacher Hours Saved", context: "Saved per teacher on end-of-term grade calculation" },
        { metric: "2,500+", label: "Active Students", context: "Managed seamlessly across preschool through grade 12" },
      ],
      bullets: ["Eliminated uncollected tuition fee disputes completely", "Parents love instant access to grade cards on their phones", "Reduced office paper costs by over $6,000 annually"],
    },
    keyFeatures: [
      { title: "Automated Report Card Engine", description: "Generates beautiful branded student PDF report cards in one click." },
      { title: "Parent Fee Portal", description: "Secure online payment with instant downloadable digital receipts." },
    ],
  },
  {
    slug: "ai-avatar-support",
    title: "AI Avatar: Interactive Virtual Customer Support Agent",
    shortTitle: "AI Avatar: Interactive Virtual Support Agent",
    formulaSummary:
      "A real-time WebGL interactive 3D virtual customer assistant built with Three.js, WebAudio, and streaming LLMs, reducing customer support queue times by 78% across 15,000 daily queries.",
    clientType: "Enterprise E-Commerce & SaaS",
    clientName: "OmniChannel Retail Group",
    category: "AI & Enterprise Automation",
    coverImage: workSaas,
    tags: ["Three.js", "Audio Streaming", "WebGL", "LLM", "Virtual Human"],
    featuredOnHome: true,
    order: 11,
    timeline: "Live in Production",
    status: "Live in Production",
    problem: {
      heading: "Impersonal Support Chatbots & Frustrated Customers",
      description: "Standard text chatbots feel cold and frustrating to customers, leading to low satisfaction ratings, high support agent escalations, and lost cart checkouts.",
      painPoints: ["Customer drop-off with rigid rule-based chatbots", "Overworked human support agents answering the same 20 repetitive questions", "Poor brand perception from robotic generic responses"],
    },
    solution: {
      heading: "Lifelike Animated 3D Avatar with Natural Lip Syncing",
      description: "Built a photorealistic 3D avatar that speaks naturally in real time, gestures dynamically, answers complex product questions, and guides customers through checkout with empathetic voice inflection.",
      keyDeliverables: ["Sub-300ms speech response with real-time phoneme lip sync", "Product recommendation engine embedded in conversation", "Seamless transfer to human tier-2 agents with full conversation context"],
    },
    stack: ["Three.js", "WebAudio", "Python", "FastAPI", "React", "Vector DB"],
    architecture: {
      overview: "Client mic stream is transcribed on the fly, evaluated against company knowledge base vectors, and returned as streaming audio with blendshape animation parameters.",
      flowSteps: [
        { step: "01", title: "Customer Voice Input", description: "Customer speaks question naturally through browser." },
        { step: "02", title: "Semantic Knowledge Retrieval", description: "RAG engine finds accurate product specs and return policies." },
        { step: "03", title: "Synthesized Speech & Visemes", description: "Streaming voice and facial muscle targets sent to browser." },
        { step: "04", title: "Real-Time Avatar Animation", description: "Avatar gestures and responds with fluid facial expressions." },
      ],
    },
    results: {
      stats: [
        { metric: "<300ms", label: "Voice Latency", context: "Instant conversational audio and visual response" },
        { metric: "78%", label: "Queue Reduction", context: "Routine questions resolved without human ticket escalation" },
        { metric: "4.8/5", label: "Customer CSAT", context: "Highest satisfaction score among retail AI support tools" },
      ],
      bullets: ["Transformed basic chatbot into a memorable interactive brand experience", "Increased cart checkout conversions by 22% via guided avatar assistance", "Handled holiday peak traffic spikes with zero extra customer service headcount"],
    },
    keyFeatures: [
      { title: "Real-Time Facial Lip Sync", description: "Accurate mouth viseme animations synced to audio wave packets." },
      { title: "Live Product Demonstrator", description: "Avatar holds up and highlights 3D product models during conversation." },
    ],
  },
  {
    slug: "corpquest-gamification",
    title: "CorpQuest: Gamified KPI Visualization & Employee Performance Engine",
    shortTitle: "CorpQuest: Gamified KPI Visualization",
    formulaSummary:
      "An interactive gamified performance management dashboard built with React 19, Tailwind CSS, and WebGL, boosting daily employee milestone engagement by 44% across 800+ team members.",
    clientType: "Enterprise HR & Sales Operations",
    clientName: "Global Tech Enterprise",
    category: "Cloud & Web Applications",
    coverImage: workData,
    tags: ["Gamification", "React 19", "Tailwind CSS", "Enterprise", "PostgreSQL"],
    featuredOnHome: true,
    order: 12,
    timeline: "Live in Production",
    status: "Live in Production",
    problem: {
      heading: "Dull Corporate KPI Dashboards & Employee Metric Disengagement",
      description: "Traditional corporate spreadsheets and static charts demotivate sales and support teams, resulting in low performance accountability and high quarterly burnout.",
      painPoints: ["Employees ignoring dull quarterly goal tracking spreadsheets", "Sales reps unaware of daily pacing against quotas", "Lack of recognition for hard work causing low team morale"],
    },
    solution: {
      heading: "RPG-Inspired Milestone Progression with Real Rewards",
      description: "Transformed business goals into quests, levels, and team leaderboards where daily completed tasks earn badges, tier rewards, and transparent company-wide celebrations.",
      keyDeliverables: ["Live sales team quest leaderboards with celebration particles", "Personal progress avatars leveling up with KPI achievements", "Automated Slack and Teams milestone celebration webhooks"],
    },
    stack: ["React 19", "TypeScript", "Canvas Confetti", "Node.js", "PostgreSQL"],
    architecture: {
      overview: "CRM and ticketing webhooks feed daily performance metrics into an event aggregator, calculating XP points and broadcasting live celebrations across the office monitors.",
      flowSteps: [
        { step: "01", title: "Metric Event Ingestion", description: "Sales closed or tickets resolved pushed via webhook." },
        { step: "02", title: "XP & Quest Calculation", description: "Rules engine assigns experience points and unlocks achievements." },
        { step: "03", title: "Leaderboard Real-Time Broadcast", description: "Office monitor displays animate celebration banners." },
        { step: "04", title: "Reward Redemption", description: "Employees redeem earned points for gift cards and company perks." },
      ],
    },
    results: {
      stats: [
        { metric: "44%", label: "Engagement Lift", context: "Increase in daily active employee goal reviews" },
        { metric: "28%", label: "Sales Velocity", context: "Boost in monthly closed deals via gamified targets" },
        { metric: "800+", label: "Active Employees", context: "Logging in daily to review quests and team achievements" },
      ],
      bullets: ["Made quarterly sales sprints fun, engaging, and highly transparent", "Reduced employee turnover by celebrating micro-wins consistently", "Integrated with existing CRM systems with zero manual data entry"],
    },
    keyFeatures: [
      { title: "Team Quest Battles", description: "Friendly department vs department milestone competitions." },
      { title: "Celebration Broadcasts", description: "Real-time sound effects and confetti when big deals close." },
    ],
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
