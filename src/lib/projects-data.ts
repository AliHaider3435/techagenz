import drIqbalKharal from "@/assets/dr-iqbal-kharal.webp";
import garwanLawChamber from "@/assets/garwan-law-chamber.webp";
import drSajidSohail from "@/assets/dr-sajid-sohail.webp";
import workSaas from "@/assets/work-saas.webp";
import workDev from "@/assets/work-dev.webp";
import workData from "@/assets/work-data.webp";

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
  clientName?: string;
  category: "WhatsApp & Automation" | "ERP & Systems" | "Healthcare" | "Legal Tech" | "Custom Software";
  coverImage: string;
  tags: string[];
  featuredOnHome: boolean;
  order: number;
  timeline: string;
  status: "Live in Production" | "Deployed & Maintained";

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
    diagramType?: "mermaid" | "flow";
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
  "WhatsApp & Automation",
  "ERP & Systems",
  "Healthcare",
  "Legal Tech",
] as const;

export const projects: CaseStudy[] = [
  {
    slug: "whatsapp-clinic-booking",
    title: "WhatsApp Booking Automation: Real-Time Appointment Scheduling for a Neurosurgery Clinic",
    shortTitle: "WhatsApp Clinic Booking Automation",
    formulaSummary:
      "A WhatsApp-based appointment booking and queue automation system built with WhatsApp Cloud API, Node.js, and PostgreSQL for a high-volume neurosurgery clinic, handling 1,800+ patient bookings per month, eliminating 100% of double-booking errors, and saving 25+ hours of front-desk scheduling work per week.",
    clientType: "A high-volume neurosurgery & specialist clinic",
    clientName: "Dr. Iqbal Ahmad Kharal Clinic",
    category: "WhatsApp & Automation",
    coverImage: drIqbalKharal,
    tags: ["WhatsApp API", "Automation", "Healthcare", "Node.js"],
    featuredOnHome: true,
    order: 1,
    timeline: "Live in 3 weeks",
    status: "Live in Production",
    problem: {
      heading: "Overcrowded Waiting Rooms & Relentless Phone Disruptions",
      description:
        "The clinic handled over 70 patients daily through direct phone calls and walk-in registers. Receptionists spent up to 5 hours every day answering the same scheduling questions, while manual record-keeping produced frequent double-bookings and 2-hour waiting room delays.",
      painPoints: [
        "Receptionists overwhelmed with 120+ repetitive phone calls daily",
        "Patients waiting 2 to 3 hours beyond consultation slot times",
        "Manual registers frequently creating conflicting appointment slots",
        "No automated way to notify patients when emergency surgeries caused clinic delays",
      ],
    },
    solution: {
      heading: "Automated Conversational Scheduling & Real-Time Queue Engine",
      description:
        "Tech Agenz built a WhatsApp-native scheduling flow that allows patients to select dates, choose doctor sessions, and receive instant QR confirmation passes directly on WhatsApp. Front-desk staff manage queues via a responsive control dashboard with atomic database locks.",
      keyDeliverables: [
        "24/7 self-service WhatsApp booking bot with natural Urdu & English prompt flows",
        "Atomic database slot reservation preventing double bookings under high concurrent traffic",
        "Automated WhatsApp reminder and delay notifications triggered via clinic webhook",
        "Doctor and receptionist dashboard for real-time queue management and emergency schedule freezes",
      ],
    },
    stack: ["WhatsApp Cloud API", "Node.js", "PostgreSQL", "Calendar Webhooks", "Docker", "Tailwind CSS"],
    architecture: {
      overview:
        "When a patient messages the clinic's WhatsApp business number, the webhook verifies slot availability against PostgreSQL with atomic row-level locks, sends an instant confirmation payload, and registers the patient in the clinic's live queue dashboard.",
      flowSteps: [
        {
          step: "01",
          title: "Patient Inquires via WhatsApp",
          description: "Patient initiates booking in English or Urdu; webhook queries active physician schedule.",
        },
        {
          step: "02",
          title: "Atomic Slot Allocation",
          description: "System reserves selected slot with PostgreSQL database row locking, preventing collisions.",
        },
        {
          step: "03",
          title: "Instant Ticket & Directions",
          description: "Patient receives automated WhatsApp confirmation with booking ID, token number, and clinic Google Maps link.",
        },
        {
          step: "04",
          title: "Live Queue & Delay Broadcasts",
          description: "Clinic dashboard automatically alerts waiting patients if surgery creates unexpected schedule shifts.",
        },
      ],
    },
    results: {
      stats: [
        { metric: "1,800+", label: "Monthly Bookings", context: "Handled seamlessly without reception call intervention" },
        { metric: "100%", label: "Double-Booking Elimination", context: "Zero booking collision incidents since go-live" },
        { metric: "25+ hrs", label: "Weekly Front-Desk Time Saved", context: "Staff redirected from calls to in-clinic patient care" },
        { metric: "3 Weeks", label: "Go-Live Time", context: "From initial specification to full production rollout" },
      ],
      bullets: [
        "Staff phone inquiry load reduced by over 70% during peak morning hours",
        "Patient waiting room overcrowding dropped by 42% due to precise arrival windows",
        "Patient no-show rate reduced to below 6% through automated WhatsApp 2-hour reminders",
        "Zero app download required: 100% accessible to elderly and non-tech-savvy patients",
      ],
    },
    keyFeatures: [
      {
        title: "Bilingual WhatsApp Bot",
        description: "Fluent conversational flow in English and Roman Urdu guiding patients through time selection.",
        tag: "Conversational UI",
      },
      {
        title: "Atomic Slot Reservation",
        description: "Database-enforced isolation ensuring two patients can never secure the same minute slot.",
        tag: "Reliability",
      },
      {
        title: "Doctor Control Console",
        description: "One-click emergency schedule freezes, consultation completion counters, and patient history review.",
        tag: "Clinic Dashboard",
      },
      {
        title: "Automated Rescheduling",
        description: "Patients can easily modify or cancel appointments through WhatsApp, freeing slots immediately for others.",
        tag: "Self-Service",
      },
    ],
    testimonial: {
      quote:
        "The WhatsApp booking platform eliminated our phone chaos. Patients get their token numbers before leaving home, and our reception desk is no longer crowded with frustrated families.",
      author: "Clinical Operations Lead",
      role: "Practice Administrator",
      organization: "Neurosurgery & Specialist Clinical Center",
    },
  },
  {
    slug: "erpnext-supply-chain",
    title: "ERPNext Cloud Deployment: Centralized Inventory & Accounting for a Multi-Branch Wholesale Distributor",
    shortTitle: "ERPNext Multi-Branch Inventory & Accounting",
    formulaSummary:
      "A cloud-hosted ERPNext enterprise system built with Frappe Framework, Python, and MariaDB for a multi-branch wholesale distributor, automating 10,000+ monthly stock movements across 4 warehouses, cutting monthly financial close time by 4 days, and going live in 5 weeks.",
    clientType: "A regional wholesale distributor & supply group",
    clientName: "Multi-Branch Distribution Enterprise",
    category: "ERP & Systems",
    coverImage: workSaas,
    tags: ["ERPNext", "Frappe", "Python", "MariaDB", "Enterprise"],
    featuredOnHome: true,
    order: 2,
    timeline: "Live in 5 weeks",
    status: "Deployed & Maintained",
    problem: {
      heading: "Fragmented Spreadsheets & Blind Inventory Across Warehouses",
      description:
        "With 4 regional warehouses and over 1,500 wholesale accounts, the business relied on disjointed Excel sheets and separate desktop accounting software. Stock balances were routinely inaccurate, resulting in overselling high-demand items and taking 8 days to finalize monthly financial statements.",
      painPoints: [
        "Inaccurate inventory across 4 warehouses causing delayed fulfillment and duplicate orders",
        "Sales reps unable to check real-time stock levels while visiting wholesale clients",
        "8 to 10 days required each month to reconcile vendor invoices and bank statements manually",
        "Zero automated audit trail for item transfers and dispatch authorizations",
      ],
    },
    solution: {
      heading: "Unified Cloud ERPNext with Role-Based Access & Auto-Reconciliation",
      description:
        "Tech Agenz architected and configured an enterprise-grade ERPNext instance on dedicated cloud infrastructure. We migrated 4 years of historical financial data, set up automated inter-warehouse transfer workflows, and gave field sales representatives mobile inventory lookups.",
      keyDeliverables: [
        "End-to-end ERPNext setup covering Buying, Selling, Stock, and General Ledger modules",
        "Real-time multi-warehouse inventory tracking with barcode scanning integration",
        "Mobile-optimized sales rep portal with instant customer credit checking and quotation dispatch",
        "Automated financial reconciliation connecting bank feeds with sales and purchase invoices",
      ],
    },
    stack: ["ERPNext v15", "Frappe Framework", "Python", "MariaDB", "Docker", "Nginx", "Redis"],
    architecture: {
      overview:
        "Containerized ERPNext stack behind Nginx reverse proxy with SSL termination, automated nightly database snapshots, Redis caching for fast report generation, and isolated role permissions per warehouse location.",
      flowSteps: [
        {
          step: "01",
          title: "Order Entry & Credit Check",
          description: "Sales rep creates order on mobile; system checks client credit limit and live warehouse stock.",
        },
        {
          step: "02",
          title: "Automated Pick & Pack Slip",
          description: "Warehouse manager receives instant picking slip with exact bin location.",
        },
        {
          step: "03",
          title: "Real-Time Stock Depletion",
          description: "Goods dispatched; stock balance decrements instantly across company-wide registers.",
        },
        {
          step: "04",
          title: "Ledger Update & Invoicing",
          description: "ERPNext automatically posts balanced accounting entries and generates tax-compliant invoices.",
        },
      ],
    },
    results: {
      stats: [
        { metric: "10,000+", label: "Monthly Stock Movements", context: "Tracked across 4 warehouses with zero inventory discrepancy" },
        { metric: "4 Days", label: "Month-End Close Shaved", context: "Reduced financial close cycle from 8 days down to 4" },
        { metric: "4 Warehouses", label: "Unified in Real-Time", context: "Replaced 12 fragmented spreadsheets with single source of truth" },
        { metric: "5 Weeks", label: "Go-Live Time", context: "Data migration, workflow customization, and staff training complete" },
      ],
      bullets: [
        "Inventory stock variance dropped to under 0.5% during routine physical audits",
        "Field sales order submission time dropped from 4 hours to under 3 minutes",
        "Automated purchase reorder triggers prevented stockouts on top 50 revenue SKUs",
        "Role-based security ensured branch managers only view their specific warehouse records",
      ],
    },
    keyFeatures: [
      {
        title: "Multi-Warehouse Inventory Control",
        description: "Bin-level location tracking, batch numbering, and automated transfer requests.",
        tag: "Supply Chain",
      },
      {
        title: "Mobile Sales Order Engine",
        description: "Field reps create quotations and sales orders on iOS/Android with live stock validation.",
        tag: "Field Mobility",
      },
      {
        title: "Automated Financial Reconciliation",
        description: "Unified accounts receivable and accounts payable with automated payment matching.",
        tag: "Finance",
      },
      {
        title: "Custom Executive Dashboards",
        description: "Visual gross margin reports, inventory aging analysis, and top customer revenue trends.",
        tag: "Analytics",
      },
    ],
    testimonial: {
      quote:
        "Tech Agenz brought order to our wholesale operations. In 5 weeks, we went from arguing over spreadsheet inventory counts to seeing every transaction live across all four facilities.",
      author: "Managing Director",
      role: "Operations & Logistics",
      organization: "Regional Wholesale Distribution Firm",
    },
  },
  {
    slug: "restaurant-cloud-pos",
    title: "Cloud POS & Kitchen Automation: Real-Time Order Routing for a Fast-Casual Restaurant Group",
    shortTitle: "Cloud POS & Kitchen Display Automation",
    formulaSummary:
      "A real-time POS and kitchen display system built with React, Node.js, and SQLite for a fast-casual restaurant group, processing 450+ daily order tickets, cutting ticket-to-kitchen transmission delays to under 1 second, and maintaining 100% offline uptime during internet outages.",
    clientType: "A multi-station fast-casual restaurant group",
    clientName: "Fast-Casual Hospitality Group",
    category: "ERP & Systems",
    coverImage: workDev,
    tags: ["Cloud POS", "Kitchen Display", "WebSocket", "React", "Local-First"],
    featuredOnHome: true,
    order: 3,
    timeline: "Live in 4 weeks",
    status: "Live in Production",
    problem: {
      heading: "Lost Paper Kitchen Tickets & System Freezes During Peak Dinner Rush",
      description:
        "The restaurant relied on thermal paper slips carried physically between cash registers and the grill station. During dinner rushes, tickets were lost, modifier instructions (no onions, extra sauce) were misread, and frequent local broadband flickers froze the old billing terminals completely.",
      painPoints: [
        "Kitchen staff losing or misreading 10+ paper order tickets during peak weekend dinner rushes",
        "Local internet drops halting cashier terminals and creating long customer queues at counter",
        "No live visibility for managers into table turnaround times and kitchen bottle-necks",
        "Manual daily cash drawer reconciliation taking managers 45 minutes every night",
      ],
    },
    solution: {
      heading: "Offline-First Cloud POS with Real-Time Kitchen Display Screens (KDS)",
      description:
        "We built an offline-first POS application paired with color-coded kitchen display monitors. Orders route via local WebSockets instantly, persisting to an in-store SQLite cache before syncing to the cloud when internet connectivity is active.",
      keyDeliverables: [
        "Touchscreen-optimized cashier POS with custom modifiers, discounts, and split billing",
        "Interactive Kitchen Display System (KDS) replacing paper slips with color-coded timers",
        "Local-first synchronization protocol ensuring uninterrupted billing during internet cuts",
        "Centralized manager dashboard for live gross revenue, food waste tracking, and staff shifts",
      ],
    },
    stack: ["React", "TypeScript", "Node.js", "WebSocket", "SQLite Local-First", "Tailwind CSS", "Thermal Print API"],
    architecture: {
      overview:
        "Cashier terminals connect over a secure local Wi-Fi WebSocket server. Even if the broadband connection goes down, orders continue printing and kitchen screens update seamlessly. When cloud connectivity resumes, transactions background-sync automatically.",
      flowSteps: [
        {
          step: "01",
          title: "Order Taken at Counter",
          description: "Cashier inputs items and customer customization modifiers on responsive touchscreen.",
        },
        {
          step: "02",
          title: "Sub-Second Kitchen Broadcast",
          description: "Order routes via local WebSocket to grill and drink KDS screens within 200ms.",
        },
        {
          step: "03",
          title: "Color-Coded Prep Timer",
          description: "Kitchen screen monitors prep duration: green (<5 min), yellow (5-10 min), red (>10 min).",
        },
        {
          step: "04",
          title: "Cloud Sync & Cash Closure",
          description: "Transaction details sync to owner cloud analytics with automated end-of-day drawer balancing.",
        },
      ],
    },
    results: {
      stats: [
        { metric: "450+", label: "Daily Order Tickets", context: "Processed flawlessly across counter and takeaway channels" },
        { metric: "<1 sec", label: "Ticket-to-Kitchen Speed", context: "Instant WebSocket display replacing physical paper slips" },
        { metric: "100%", label: "Offline Reliability", context: "Zero billing stops or lost orders during internet dropouts" },
        { metric: "35%", label: "Faster Prep Turnaround", context: "Average customer order fulfillment time reduced significantly" },
      ],
      bullets: [
        "Kitchen ticket misinterpretation and missing food items reduced to zero",
        "Nightly register reconciliation time reduced from 45 minutes down to 8 minutes",
        "Cashier staff onboarding completed in under 15 minutes due to intuitive UI",
        "Real-time food waste recording saved an estimated 12% on raw ingredient spoilage",
      ],
    },
    keyFeatures: [
      {
        title: "Local-First Offline Resilience",
        description: "Zero downtime during internet disconnects; instant background sync on reconnect.",
        tag: "High Availability",
      },
      {
        title: "Station-Specific KDS",
        description: "Separate kitchen screens for grill, fryer, and beverage stations with automated ticket splitting.",
        tag: "Kitchen Ops",
      },
      {
        title: "Modifier & Allergen Management",
        description: "High-contrast visual badges for special instructions, substitutions, and allergen warnings.",
        tag: "Order Accuracy",
      },
      {
        title: "Real-Time Sales Dashboard",
        description: "Live revenue monitoring, average ticket value, and hourly rush heatmaps accessible remotely.",
        tag: "Management",
      },
    ],
    testimonial: {
      quote:
        "The system has not failed us once, even when our internet provider goes down for hours. Our kitchen is quieter, orders go out 30% faster, and cash reconciliation at night is effortless.",
      author: "Operating Partner",
      role: "General Manager",
      organization: "Fast-Casual Hospitality Brand",
    },
  },
  {
    slug: "garwan-law-portal",
    title: "Legal Practice Management: Client Intake & Consultation Portal for a Corporate Law Firm",
    shortTitle: "Garwan Law Chamber Client Intake Portal",
    formulaSummary:
      "A secure digital legal intake and practice portal built with React 19, TypeScript, and PostgreSQL for a premier corporate law chamber, streamlining 300+ monthly client intake briefs, cutting consultation coordination overhead by 85%, and delivering sub-second encrypted case access.",
    clientType: "A civil and corporate legal chamber",
    clientName: "Garwan Law Chamber",
    category: "Legal Tech",
    coverImage: garwanLawChamber,
    tags: ["Legal Tech", "Client Intake", "React 19", "PostgreSQL", "Security"],
    featuredOnHome: true,
    order: 4,
    timeline: "Live in 3 weeks",
    status: "Live in Production",
    problem: {
      heading: "Unstructured Case Inquiries & Disorganized Advocate Schedules",
      description:
        "Prospective corporate and civil litigants initiated contact through informal WhatsApp messages and random phone inquiries. Advocates had no structured upfront brief to evaluate jurisdictional merit, and administrative staff spent hours coordinating advocate consultation calendars.",
      painPoints: [
        "Litigants submitted vague or incomplete case facts, wasting expensive senior lawyer consultation hours",
        "Staff manually emailing back and forth to schedule appointments across multiple senior advocates",
        "No central directory demonstrating practice area credentials and jurisdiction experience to corporate clients",
        "Prospective international clients unable to book consultations across different time zones",
      ],
    },
    solution: {
      heading: "Authoritative Digital Practice Portal with Confidential Intake Engine",
      description:
        "Tech Agenz designed and engineered an authoritative digital portal tailored to the chamber's practice hierarchy. The platform integrates structured case intake forms with jurisdiction vetting, calendar synchronization, and institutional credential showcases.",
      keyDeliverables: [
        "Structured digital intake questionnaire capturing relevant facts and documents prior to consultation",
        "Automated advocate calendar synchronization with timezone conversion for international clients",
        "Prestigious practice area directory outlining high-profile appellate, corporate, and civil litigation experience",
        "Encrypted database storage ensuring client inquiry confidentiality and legal privilege compliance",
      ],
    },
    stack: ["React 19", "TypeScript", "Tailwind CSS", "Node.js", "PostgreSQL", "REST API"],
    architecture: {
      overview:
        "Modern server-rendered portal built with React 19 and Tailwind CSS, backed by an encrypted PostgreSQL database. All client intake data is validated and encrypted in transit and at rest.",
      flowSteps: [
        {
          step: "01",
          title: "Litigant Intake & Verification",
          description: "Prospective client completes structured brief specifying practice area, forum, and urgency.",
        },
        {
          step: "02",
          title: "Advocate Calendar Matching",
          description: "System verifies advocate availability, preventing conflicts of interest and double bookings.",
        },
        {
          step: "03",
          title: "Confidential Brief Dispatch",
          description: "Senior lawyer receives organized case summary and uploaded documentation prior to meeting.",
        },
        {
          step: "04",
          title: "Automated Confirmation & Reminders",
          description: "Client receives calendar invite, video consultation link or chamber conference room details.",
        },
      ],
    },
    results: {
      stats: [
        { metric: "300+", label: "Monthly Client Intakes", context: "Streamlined without manual staff message sorting" },
        { metric: "85%", label: "Coordination Time Saved", context: "Reduction in initial consultation administrative overhead" },
        { metric: "<0.8s", label: "Page Load Speed", context: "Blazing fast mobile responsiveness across Pakistan and abroad" },
        { metric: "100%", label: "Confidentiality Adherence", context: "Encrypted upfront case intake preserving legal privilege" },
      ],
      bullets: [
        "Senior advocates enter initial consultations fully briefed with verified jurisdiction facts",
        "Noticeable increase in corporate client conversions from institutional referrals",
        "Eliminated no-shows through automated calendar invites and email confirmations",
        "Sub-second load times on both mobile and desktop devices",
      ],
    },
    keyFeatures: [
      {
        title: "Confidential Case Intake Flow",
        description: "Intelligent questionnaires gathering essential case facts and documents prior to first consultation.",
        tag: "Data Security",
      },
      {
        title: "Advocate Calendar Sync",
        description: "Direct integration with lawyer schedules preventing overlapping consultation commitments.",
        tag: "Scheduling",
      },
      {
        title: "Practice Area Directory",
        description: "Authoritative showcases for Constitutional, Corporate, Civil, and Appellate litigation.",
        tag: "Institutional Branding",
      },
      {
        title: "Time-Zone Smart Scheduling",
        description: "Enables overseas corporate clients to book consultations in their local time zone effortlessly.",
        tag: "Global Access",
      },
    ],
    testimonial: {
      quote:
        "Tech Agenz gave our chamber a modern, authoritative portal. Our intake is now structured, our attorneys receive pre-briefed case summaries, and administrative coordination takes a fraction of the time.",
      author: "Senior Advocate",
      role: "Managing Partner",
      organization: "Garwan Law Chamber",
    },
  },
  {
    slug: "clinical-workflow-engine",
    title: "Clinical Workflow Engine: Rapid Consultation & Triage Portal for a Medical Center Specialist",
    shortTitle: "Dr. Sajid Sohail Clinical Portal",
    formulaSummary:
      "A clinical triage and automated 15-minute appointment slot engine built with React 19, Express, and PostgreSQL for a specialist medical center practice, achieving a <5% patient no-show rate, eliminating registration bottlenecks, and saving 4 minutes per consultation.",
    clientType: "A hospital-based medical specialist practice",
    clientName: "Dr. Sajid Sohail (Rahmania Medical Center)",
    category: "Healthcare",
    coverImage: drSajidSohail,
    tags: ["Healthcare", "Workflow Engine", "React 19", "Express", "PostgreSQL"],
    featuredOnHome: false,
    order: 5,
    timeline: "Live in 3 weeks",
    status: "Live in Production",
    problem: {
      heading: "Scheduling Clashes & Time-Consuming Symptom Recording",
      description:
        "Operating inside Rahmania Medical Center, the specialist practice faced friction between hospital reception, phone inquiries, and daily quotas. Recording basic symptoms on paper charts wasted 4 to 5 minutes of consultation time per patient.",
      painPoints: [
        "Paper intake charts consuming 4+ minutes of doctor time per consultation",
        "Patient no-show rates reaching 18% during emergency hospital reschedules",
        "Hospital reception desk unable to view live remaining doctor consultation quotas",
        "Difficulties in retrieving past prescription history during follow-up visits",
      ],
    },
    solution: {
      heading: "Automated 15-Minute Slot Engine with Pre-Consultation Questionnaires",
      description:
        "We built a specialized clinic management portal featuring 15-minute dynamic slot allocation, digital symptom intake questionnaires, and a multi-user reception/physician dashboard.",
      keyDeliverables: [
        "Dynamic 15-minute appointment slot booking system tailored to hospital consultation quotas",
        "Pre-filled digital symptom intake questionnaires submitted prior to patient arrival",
        "Doctor control panel with 1-click consultation completion and patient history lookup",
        "Dedicated hospital receptionist view for real-time check-in and queue monitoring",
      ],
    },
    stack: ["React 19", "TypeScript", "Tailwind CSS", "Node.js", "Express", "PostgreSQL"],
    architecture: {
      overview:
        "A lightweight, sub-second web platform deployed with secure database isolation, providing instantaneous search for patient records and synchronized queue updates between reception and examination rooms.",
      flowSteps: [
        {
          step: "01",
          title: "Online / Counter Booking",
          description: "Patient or receptionist books 15-minute window with automated slot validation.",
        },
        {
          step: "02",
          title: "Digital Intake Form",
          description: "Patient submits primary symptom details and previous history digitally.",
        },
        {
          step: "03",
          title: "Doctor Review at a Glance",
          description: "Physician opens pre-filled medical brief instantly on consultation screen.",
        },
        {
          step: "04",
          title: "1-Click Follow-Up Scheduling",
          description: "Post-consultation follow-up is booked directly into the schedule.",
        },
      ],
    },
    results: {
      stats: [
        { metric: "<5%", label: "Patient No-Show Rate", context: "Down from 18% through automated pre-visit notifications" },
        { metric: "4 Mins", label: "Saved Per Consultation", context: "Pre-filled medical intake eliminates repetitive manual note taking" },
        { metric: "35%", label: "Consultation Volume Growth", context: "Streamlined scheduling allows more patients seen without overtime" },
        { metric: "<1 sec", label: "Patient History Lookup", context: "Instantaneous access to past diagnosis and prescription records" },
      ],
      bullets: [
        "Patient waiting room congestion eliminated through enforced 15-minute time slots",
        "Zero registration paperwork required at hospital reception desk",
        "Doctor can freeze or extend consultation sessions with a single tap",
        "Fully HIPAA/confidentiality compliant encrypted database architecture",
      ],
    },
    keyFeatures: [
      {
        title: "15-Minute Atomic Slotting",
        description: "Intelligent time allocation preventing appointment overlaps and pacing clinical flow.",
        tag: "Pacing",
      },
      {
        title: "Symptom Intake Questionnaire",
        description: "Structured digital intake saving doctors 4 minutes of questioning per patient visit.",
        tag: "Efficiency",
      },
      {
        title: "Hospital Reception Sync",
        description: "Shared live queue view between hospital entrance and doctor's private examination room.",
        tag: "Collaboration",
      },
      {
        title: "Instant Record Retrieval",
        description: "Search previous consultation notes and prescriptions by phone number in under 1 second.",
        tag: "Records",
      },
    ],
    testimonial: {
      quote:
        "The digital symptom intake alone saves me several minutes with every patient. The entire clinic operates on time now, with practically no no-shows.",
      author: "Clinical Specialist",
      role: "Consultant Physician",
      organization: "Rahmania Medical Center",
    },
  },
  {
    slug: "ecommerce-inventory-sync",
    title: "Omnichannel Inventory Automation: Real-Time Stock & Order Sync for an Apparel Retailer",
    shortTitle: "Omnichannel Inventory & Order Sync",
    formulaSummary:
      "An automated multi-channel inventory sync service built with Python, FastAPI, and Redis for a growing fashion retailer, synchronizing Shopify, Daraz, and physical warehouse inventory within 3 seconds and preventing 100% of out-of-stock overselling incidents.",
    clientType: "An omnichannel apparel retail and e-commerce brand",
    clientName: "Apparel Retail & E-Commerce Brand",
    category: "Custom Software",
    coverImage: workData,
    tags: ["API Integration", "Python", "FastAPI", "Redis", "E-Commerce"],
    featuredOnHome: false,
    order: 6,
    timeline: "Live in 4 weeks",
    status: "Deployed & Maintained",
    problem: {
      heading: "Costly Stockout Penalties & Manual Multi-Channel Updates",
      description:
        "Selling across their own web store, third-party marketplaces, and a physical outlet, the retailer manually updated inventory counts at the end of each day. Flash sales frequently resulted in the same item being bought on two channels simultaneously, causing cancellation fees and frustrated buyers.",
      painPoints: [
        "Overselling popular garments during sales campaigns leading to marketplace account penalties",
        "Staff spending 2 hours every evening manually reconciling spreadsheets across channels",
        "Delayed order fulfillment due to inaccurate physical warehouse location records",
        "No automated notifications when inventory fell below minimum safe thresholds",
      ],
    },
    solution: {
      heading: "Event-Driven Webhook Sync Service with Sub-3-Second Propagation",
      description:
        "Tech Agenz built a high-performance Python/FastAPI microservice connected via webhooks. Whenever an item is sold on any channel or in-store POS, the service instantly updates stock counts across all connected platforms in under 3 seconds.",
      keyDeliverables: [
        "Bi-directional webhook synchronization between web store, marketplace, and warehouse",
        "In-memory Redis inventory cache ensuring sub-3-second cross-platform quantity updates",
        "Automated low-stock alerts sent to inventory buyers via Slack and WhatsApp webhooks",
        "Unified dispatch dashboard with automated shipping label generation",
      ],
    },
    stack: ["Python", "FastAPI", "Redis", "PostgreSQL", "Shopify Webhooks", "Docker"],
    architecture: {
      overview:
        "Event-driven architecture using Redis Pub/Sub and FastAPI. When a webhook fires from any marketplace, the inventory event is processed idempotently, stock is updated in PostgreSQL, and sync events push out immediately.",
      flowSteps: [
        {
          step: "01",
          title: "Sale Event Triggered",
          description: "Order placed on Shopify, Daraz, or physical POS triggers instant webhook.",
        },
        {
          step: "02",
          title: "Idempotent Event Processing",
          description: "FastAPI worker consumes event, deducts stock, and locks inventory in Redis.",
        },
        {
          step: "03",
          title: "Sub-3s Multi-Channel Push",
          description: "Updated inventory count is broadcast to all remaining sales channels within 3 seconds.",
        },
        {
          step: "04",
          title: "Warehouse Dispatch Order",
          description: "Picking ticket auto-prints at warehouse dispatch station for same-day packing.",
        },
      ],
    },
    results: {
      stats: [
        { metric: "<3 sec", label: "Cross-Platform Sync", context: "Instant inventory propagation across all sales channels" },
        { metric: "100%", label: "Overselling Prevention", context: "Zero marketplace out-of-stock cancellation penalties" },
        { metric: "15,000+", label: "SKUs Managed", context: "Complex size, color, and fit variations synchronized seamlessly" },
        { metric: "14 hrs", label: "Weekly Labor Saved", context: "Eliminated daily manual spreadsheet inventory adjustments" },
      ],
      bullets: [
        "Marketplace seller ratings improved to 4.9/5 due to zero stockout cancellations",
        "Flash sale capacity increased by 300% without fear of duplicate inventory sales",
        "Automated supplier reorder alerts cut stockout duration on bestsellers from 12 days to 2 days",
        "Centralized packing station reduced order mis-picks by 80%",
      ],
    },
    keyFeatures: [
      {
        title: "Sub-3-Second Sync",
        description: "Event-driven Redis pipeline propagating inventory changes across all channels near-instantly.",
        tag: "Performance",
      },
      {
        title: "Overselling Guard",
        description: "Automated buffer stock protection holding back last units to prevent concurrent purchase collisions.",
        tag: "Protection",
      },
      {
        title: "Automated Shipping Labels",
        description: "One-click courier label generation with automated tracking code sync back to customers.",
        tag: "Fulfillment",
      },
      {
        title: "Low-Stock Reorder Triggers",
        description: "Real-time alerts via WhatsApp and Slack when SKU quantities breach safety thresholds.",
        tag: "Automation",
      },
    ],
    testimonial: {
      quote:
        "Overselling during flash sales used to cost us thousands in penalties. Tech Agenz's sync service runs completely hands-off. We haven't had a single oversold item since it went live.",
      author: "E-Commerce Director",
      role: "Head of Operations",
      organization: "Omnichannel Fashion Retailer",
    },
  },
];

export function getAllProjects(): CaseStudy[] {
  return projects;
}

export function getFeaturedProjects(): CaseStudy[] {
  return projects.filter((p) => p.featuredOnHome).slice(0, 4);
}

export function getProjectBySlug(slug: string): CaseStudy | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getRelatedProjects(slug: string, limit = 3): CaseStudy[] {
  const current = getProjectBySlug(slug);
  if (!current) return projects.slice(0, limit);
  return projects
    .filter((p) => p.slug !== slug)
    .sort((a, b) => (a.category === current.category ? -1 : 1))
    .slice(0, limit);
}
