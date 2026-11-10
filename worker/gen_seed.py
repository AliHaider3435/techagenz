#!/usr/bin/env python3
"""
Generates a fresh-install seed SQL artifact from:
  - src/data/cms-data.json (team + blogs)
  - Case Study records mirrored from src/lib/projects-data.ts in PROJECTS

This script does not generate or modify versioned migrations.
"""
import json
import os
import re

ROOT = "/mnt/e/Tech Agenz/techagenz"
MIGRATIONS_DIR = os.path.join(ROOT, "worker/migrations")
OUT = os.path.join(ROOT, "worker/generated-artifacts/seed_data.sql")

def sql_str(val):
    if val is None:
        return "NULL"
    s = str(val).replace("'", "''")
    return f"'{s}'"

lines = []
lines.append("-- ═══════════════════════════════════════════════════════════════════════════")
lines.append("-- Generated Fresh-Install Seed Data")
lines.append("-- Tech Agenz — Cloudflare D1 (SQLite)")
lines.append("-- Auto-generated from cms-data.json and projects-data.ts")
lines.append("-- ═══════════════════════════════════════════════════════════════════════════")
lines.append("")

# ── Load cms-data.json ────────────────────────────────────────────────────────
with open(os.path.join(ROOT, "src/data/cms-data.json"), "r", encoding="utf-8") as f:
    cms = json.load(f)

# ── Team members ──────────────────────────────────────────────────────────────
lines.append("-- ─── Team Members ───────────────────────────────────────────────────────────")
for i, m in enumerate(cms["team"]):
    mid = m["id"]
    image = m["image"]
    title = m["title"]
    subtitle = m["subtitle"]
    border_color = m.get("borderColor", "")
    gradient = m.get("gradient", "")
    url = m.get("url", "")
    sort_order = i + 1
    lines.append(
        f"INSERT OR IGNORE INTO team_members (id, image, title, subtitle, border_color, gradient, url, sort_order) VALUES "
        f"({sql_str(mid)}, {sql_str(image)}, {sql_str(title)}, {sql_str(subtitle)}, {sql_str(border_color)}, {sql_str(gradient)}, {sql_str(url)}, {sort_order});"
    )
lines.append("")

# ── Blog Posts ────────────────────────────────────────────────────────────────
lines.append("-- ─── Blog Posts ─────────────────────────────────────────────────────────────")
for post in cms["blogs"]:
    pid = post["id"]
    title = post["title"]
    category = post.get("category", "")
    read_time = post.get("readTime", "")
    date = post.get("date", "")
    publish_date_iso = post.get("publishDateIso", "")
    author = post.get("author", "")
    image = post.get("image", "")
    excerpt = post.get("excerpt", "")
    featured = 1 if post.get("featured", False) else 0

    lines.append(
        f"INSERT OR IGNORE INTO blog_posts (id, title, category, read_time, date, publish_date_iso, author, image, excerpt, featured) VALUES "
        f"({sql_str(pid)}, {sql_str(title)}, {sql_str(category)}, {sql_str(read_time)}, {sql_str(date)}, {sql_str(publish_date_iso)}, {sql_str(author)}, {sql_str(image)}, {sql_str(excerpt)}, {featured});"
    )

    for j, kw in enumerate(post.get("keywords", [])):
        lines.append(
            f"INSERT OR IGNORE INTO blog_post_keywords (post_id, keyword, sort_order) VALUES ({sql_str(pid)}, {sql_str(kw)}, {j});"
        )

    for j, kt in enumerate(post.get("keyTakeaways", [])):
        lines.append(
            f"INSERT OR IGNORE INTO blog_post_key_takeaways (post_id, takeaway, sort_order) VALUES ({sql_str(pid)}, {sql_str(kt)}, {j});"
        )

    for j, para in enumerate(post.get("content", [])):
        lines.append(
            f"INSERT OR IGNORE INTO blog_post_content (post_id, paragraph, sort_order) VALUES ({sql_str(pid)}, {sql_str(para)}, {j});"
        )

    lines.append("")

# ── Case Studies ──────────────────────────────────────────────────────────────
# Case Study records mirror projects-data.ts. Flow steps retain their structured
# source fields; the legacy 0002 step text is formatted from those fields.
lines.append("-- ─── Case Studies ───────────────────────────────────────────────────────────")

PROJECTS = [
    {
        "slug": "dr-iqbal-kharal",
        "title": "Dr. Iqbal Ahmad Kharal: Real-Time Patient Scheduling & Queue Management System",
        "short_title": "Dr. Iqbal Ahmad Kharal Booking System",
        "formula_summary": "A real-time appointment booking and queue management system built with React, Node.js, and WhatsApp Cloud API for Dr. Iqbal Ahmad Kharal's specialist clinic, achieving a 42% decrease in waiting room congestion, zero double-booking incidents, and saving 25+ hours of front-desk scheduling work per week.",
        "client_type": "Specialist Clinical Practice",
        "client_name": "Dr. Iqbal Ahmad Kharal Clinic",
        "category": "Booking Systems & Automation",
        "cover_image": "/project-images/dr-iqbal-kharal.webp",
        "featured_on_home": True,
        "sort_order": 1,
        "timeline": "Live in Production",
        "status": "Live in Production",
        "problem_heading": "Waiting Room Congestion & Manual Reception Overload",
        "problem_description": "Handling up to 80 daily consultations through phone calls and physical reception desk registers created severe waiting room congestion. Patients frequently waited 2 to 3 hours past their estimated time. Double-bookings during surge hours frustrated patients, and clinic staff had no automated way to notify patients when appointments were delayed due to emergency procedures.",
        "solution_heading": "Atomic Slot Allocation & Real-Time Queue Monitoring",
        "solution_description": "Tech Agenz engineered a high-concurrency patient appointment booking platform. We implemented atomic slot reservation to eliminate double bookings, a mobile-first appointment booking interface requiring zero app installation, and automated WhatsApp/SMS webhooks that confirm booking details. The doctor's administrative dashboard gives immediate control over session capacity, emergency slot freezes, and real-time patient queue monitoring.",
        "architecture_overview": "Patients reserve slots through a mobile-optimized portal or WhatsApp webhook. The system validates slot availability against PostgreSQL with atomic row-level locks, transmits instant confirmation alerts, and logs the patient into the clinic's real-time queue monitor.",
        "testimonial_quote": "The automated booking system transformed our daily clinic flow. Waiting room congestion dropped dramatically, and patients arrive on time with their token numbers in hand.",
        "testimonial_author": "Clinical Administrator",
        "testimonial_role": "Operations Lead",
        "testimonial_company": "Dr. Iqbal Ahmad Kharal Clinic",
        "tags": ["WhatsApp Cloud API", "Patient Queue", "Node.js", "PostgreSQL", "Docker"],
        "pain_points": [
            "Receptionists overwhelmed with non-stop phone calls coordinating daily consultation slots",
            "Patients waiting 2 to 3 hours beyond their estimated appointment times",
            "Paper registers causing accidental double-bookings during peak clinical hours",
            "No automated notifications when emergency hospital surgeries delayed the clinic schedule",
        ],
        "deliverables": [
            "Mobile-first patient self-booking workflow with zero app download required",
            "Atomic database slot reservation completely preventing conflicting bookings",
            "Automated WhatsApp/SMS alerts for appointment confirmations and time reminders",
            "Doctor and reception control dashboard for queue monitoring and emergency session freezes",
        ],
        "stack": ["React", "Node.js", "PostgreSQL", "Calendar Webhooks", "WhatsApp Cloud API", "Docker"],
        "flow_steps": [
            {"step": "01", "title": "Slot Selection", "description": "Patient selects available consultation slot from real-time calendar."},
            {"step": "02", "title": "Atomic Lock & Reservation", "description": "Database enforces row-level locking to prevent concurrent booking conflicts."},
            {"step": "03", "title": "Automated WhatsApp Confirmation", "description": "Instant booking confirmation and token number dispatched to patient's phone."},
            {"step": "04", "title": "Live Queue Dashboard", "description": "Clinic receptionist tracks check-ins and physician views live consultation queue."},
        ],
        "stats": [
            {"label": "Wait Time Reduction", "value": "42%", "context": "Decrease in waiting room overcrowding"},
            {"label": "Double Bookings", "value": "0", "context": "Atomic database locking eliminated all collisions"},
            {"label": "Phone Load Reduced", "value": "70%+", "context": "Staff inquiry workload dropped during peak hours"},
            {"label": "Weekly Time Saved", "value": "25+ hrs", "context": "Staff hours redirected from calls to in-clinic care"},
        ],
        "bullets": [
            "42% decrease in physical waiting room overcrowding and patient wait times",
            "Near-zero missed appointments via automated WhatsApp/SMS reminders",
            "Atomic database locking eliminating double-booking incidents completely",
            "Staff phone inquiry workload reduced by over 70% during peak clinical hours",
        ],
        "key_features": [
            {"title": "Atomic Slot Reservation", "description": "PostgreSQL row-level isolation preventing two patients from booking the same slot.", "tag": "Data Integrity"},
            {"title": "Automated WhatsApp/SMS Alerts", "description": "Immediate token confirmation, location directions, and 2-hour pre-visit reminders.", "tag": "Notifications"},
            {"title": "Physician Control Console", "description": "Real-time queue tracking, one-tap emergency freezes, and daily consultation counters.", "tag": "Clinic Dashboard"},
            {"title": "Mobile-First Patient UI", "description": "Accessible to patients of all ages on any smartphone without downloading an app.", "tag": "Patient Experience"},
        ],
    },
    {
        "slug": "garwan-law-chamber",
        "title": "Garwan Law Chamber: Modernizing Legal Intake & Attorney Portals",
        "short_title": "Garwan Law Chamber Practice Portal",
        "formula_summary": "An authoritative digital legal practice portal built with React 19, TypeScript, and PostgreSQL for Garwan Law Chamber, achieving an 85% reduction in initial consultation administrative scheduling time, sub-second load times, and confidential upfront case brief management.",
        "client_type": "Corporate & Civil Law Practice",
        "client_name": "Garwan Law Chamber",
        "category": "Legal Tech",
        "cover_image": "/project-images/garwan-law-chamber.webp",
        "featured_on_home": True,
        "sort_order": 2,
        "timeline": "Live in Production",
        "status": "Live in Production",
        "problem_heading": "Unstructured Case Inquiries & Manual Advocate Coordination",
        "problem_description": "Garwan Law Chamber handled high-stakes civil and corporate inquiries primarily through informal messaging and walk-ins. Prospective clients lacked a unified platform to review practice credentials, verify attorney jurisdictions, and submit confidential case briefs. Administrative staff spent hours daily sorting unvetted inquiries and coordinating lawyer schedules manually.",
        "solution_heading": "Structured Case Intake & Advocate Consultation Management",
        "solution_description": "Tech Agenz designed and engineered a bespoke, secure legal technology portal tailored to the chamber's practice hierarchy. The platform incorporates structured case intake forms with preliminary fact gathering, automated appointment booking synced to advocate calendars, and authoritative practice directories that present credentials with institutional prestige. Deployed on modern server-rendered infrastructure with sub-second page loads and strict privacy protocols.",
        "architecture_overview": "Server-rendered architecture built with React 19, TypeScript, and PostgreSQL. Client inquiry payloads are validated, structured, and securely delivered to the chamber's administrative portal with calendar synchronization.",
        "testimonial_quote": "The portal gave our law chamber a modern, authoritative digital presence. Initial consultation intake is now structured and efficient, saving our advocates valuable time.",
        "testimonial_author": "Senior Advocate",
        "testimonial_role": "Partner",
        "testimonial_company": "Garwan Law Chamber",
        "tags": ["React 19", "TypeScript", "Tailwind CSS", "PostgreSQL", "Legal Tech"],
        "pain_points": [
            "Prospective litigants submitted incomplete case details, wasting senior attorney consultation time",
            "Staff manually coordinated schedules across multiple advocates via phone and messaging",
            "No centralized digital directory showcasing practice area expertise and jurisdictional credentials",
            "International and corporate clients lacked a seamless consultation scheduling channel",
        ],
        "deliverables": [
            "Structured digital intake questionnaires capturing jurisdiction and essential facts prior to meetings",
            "Advocate consultation booking synced to attorney calendars to eliminate scheduling conflicts",
            "Authoritative practice directory outlining Corporate, Civil, Constitutional, and Appellate practice areas",
            "High-performance responsive portal with sub-second page loads and strict privacy protection",
        ],
        "stack": ["React 19", "TypeScript", "Tailwind CSS", "Next.js / Node.js", "PostgreSQL", "REST API"],
        "flow_steps": [
            {"step": "01", "title": "Client Intake Submission", "description": "Prospective litigant selects legal domain and submits case details."},
            {"step": "02", "title": "Advocate Availability Check", "description": "System verifies advocate availability and avoids scheduling overlaps."},
            {"step": "03", "title": "Confidential Case Brief", "description": "Case summary organized into attorney calendar with preliminary facts."},
            {"step": "04", "title": "Consultation Confirmation", "description": "Client receives scheduled consultation details and conference instructions."},
        ],
        "stats": [
            {"label": "Scheduling Time Saved", "value": "85%", "context": "Reduction in initial consultation administrative coordination"},
            {"label": "Page Load Time", "value": "<0.8s", "context": "Sub-second speed on mobile and desktop devices"},
            {"label": "Confidential Intake", "value": "100%", "context": "Secure upfront briefs preserving legal privilege"},
            {"label": "Monthly Inquiries", "value": "300+", "context": "Handled through structured digital intake"},
        ],
        "bullets": [
            "85% reduction in initial consultation administrative scheduling time",
            "Confidential upfront case intake capturing critical jurisdiction details",
            "Significant increase in corporate client conversion from international and local referrals",
            "Sub-second load times and 100% mobile responsive experience for prospective litigants",
        ],
        "key_features": [
            {"title": "Confidential Case Intake Form", "description": "Captures jurisdiction, opposing parties, and factual background prior to first meeting.", "tag": "Intake Workflow"},
            {"title": "Advocate Calendar Sync", "description": "Prevents double-bookings and organizes attorney schedules automatically.", "tag": "Calendar"},
            {"title": "Institutional Practice Directory", "description": "Presents credentials and past litigation experience with institutional prestige.", "tag": "Branding"},
            {"title": "Mobile-Optimized Security", "description": "Encrypted data transmission and responsive layout on all devices.", "tag": "Security"},
        ],
    },
    {
        "slug": "dr-sajid-sohail",
        "title": "Dr. Sajid Sohail: High-Volume Clinic Operations & Patient Consultation Portal",
        "short_title": "Dr. Sajid Sohail Clinic Portal",
        "formula_summary": "A responsive patient booking and clinical consultation workflow system built with React 19, TypeScript, and PostgreSQL for Dr. Sajid Sohail at Rahmania Medical Center, achieving a <5% patient no-show rate, saving 4 minutes per consultation intake, and increasing monthly consultations by 35%.",
        "client_type": "Hospital & Medical Center Healthcare",
        "client_name": "Dr. Sajid Sohail (Rahmania Medical Center)",
        "category": "Healthcare",
        "cover_image": "/project-images/dr-sajid-sohail.webp",
        "featured_on_home": True,
        "sort_order": 3,
        "timeline": "Live in Production",
        "status": "Live in Production",
        "problem_heading": "Hospital Quota Coordination & Manual Intake Bottlenecks",
        "problem_description": "Operating within Rahmania Medical Center, Dr. Sajid Sohail required a specialized digital workflow that coordinated seamlessly between hospital reception, patient inquiries, and daily consultation quotas. Relying on paper charts and phone calls led to scheduling gaps, manual errors in patient record intake, and high no-show rates during bad weather or hospital emergencies.",
        "solution_heading": "Dynamic 15-Minute Slot Allocation & Pre-Consultation Questionnaires",
        "solution_description": "We built a tailored medical portal with 15-minute slot allocation, intelligent patient symptom intake questionnaires, and automated clinic confirmation notifications. The system features a doctor control panel to view expected patient volumes, mark completed consultations, and seamlessly reschedule appointments with one click. Hospital staff access a dedicated receptionist view to manage check-ins instantly.",
        "architecture_overview": "Lightweight, sub-second web architecture connecting patient booking with the doctor's consultation desk and hospital reception. Intake data is cached and synchronized in real time.",
        "testimonial_quote": "The digital consultation workflow transformed our clinic. The 15-minute slot allocation keeps us on schedule, and pre-filled symptom questionnaires save valuable doctor time with every patient.",
        "testimonial_author": "Clinical Practice Manager",
        "testimonial_role": "Operations Coordinator",
        "testimonial_company": "Rahmania Medical Center",
        "tags": ["React 19", "TypeScript", "Node.js", "PostgreSQL", "Healthcare"],
        "pain_points": [
            "Manual paper intake taking 4 to 5 minutes of doctor consultation time per patient",
            "Scheduling gaps and no-show rates reaching 15% due to lack of automated reminders",
            "Lack of coordination between central hospital reception desk and doctor examination room",
            "Difficulty rapidly retrieving previous prescription and consultation history",
        ],
        "deliverables": [
            "15-minute slot allocation algorithm tailored to daily hospital consultation quotas",
            "Pre-filled digital symptom intake questionnaires submitted prior to patient arrival",
            "Doctor control console with 1-click consultation completion and history lookup",
            "Dedicated receptionist view for check-ins, queue management, and quota pacing",
        ],
        "stack": ["React 19", "TypeScript", "Tailwind CSS", "Node.js", "Express", "PostgreSQL"],
        "flow_steps": [
            {"step": "01", "title": "15-Minute Slot Booking", "description": "Patient reserves consultation slot according to daily session capacity."},
            {"step": "02", "title": "Digital Symptom Intake", "description": "Patient completes brief symptom questionnaire before consultation."},
            {"step": "03", "title": "Reception Check-In", "description": "Hospital receptionist marks patient arrival with one click."},
            {"step": "04", "title": "Doctor Consultation View", "description": "Doctor accesses pre-filled brief and records follow-up instructions."},
        ],
        "stats": [
            {"label": "Patient No-Show Rate", "value": "<5%", "context": "Down from 15% via automated pre-visit reminders"},
            {"label": "Saved Per Consultation", "value": "4 Mins", "context": "Pre-filled medical intake saves doctor time"},
            {"label": "Consultation Growth", "value": "35%", "context": "Increase in verified monthly patient consultations"},
            {"label": "Record Retrieval", "value": "<1 sec", "context": "Instantaneous access to appointment history"},
        ],
        "bullets": [
            "35% increase in verified monthly patient consultations through automated scheduling",
            "No-show rate dropped to under 5% following automated pre-consultation reminders",
            "Pre-filled medical intake questionnaires saving 4 minutes per doctor consultation",
            "Integrated patient ledger and appointment history accessible in under 1 second",
        ],
        "key_features": [
            {"title": "15-Minute Slot Allocation", "description": "Optimized consultation pacing preventing waiting room overcrowding.", "tag": "Scheduling"},
            {"title": "Symptom Intake Questionnaire", "description": "Pre-fills essential patient history before the doctor consultation begins.", "tag": "Clinical Efficiency"},
            {"title": "Hospital Receptionist Sync", "description": "Seamless coordination between hospital reception and physician room.", "tag": "Collaboration"},
            {"title": "Instant History Lookup", "description": "Look up previous consultation notes and prescriptions in under 1 second.", "tag": "Records"},
        ],
    },
]

for p in PROJECTS:
    slug = p["slug"]
    fi = 1 if p["featured_on_home"] else 0
    lines.append(
        f"INSERT OR IGNORE INTO case_studies (slug, title, short_title, formula_summary, client_type, client_name, category, cover_image, "
        f"featured_on_home, sort_order, timeline, status, problem_heading, problem_description, solution_heading, solution_description, "
        f"architecture_overview, testimonial_quote, testimonial_author, testimonial_role, testimonial_company) VALUES "
        f"({sql_str(slug)}, {sql_str(p['title'])}, {sql_str(p['short_title'])}, {sql_str(p['formula_summary'])}, "
        f"{sql_str(p['client_type'])}, {sql_str(p['client_name'])}, {sql_str(p['category'])}, {sql_str(p['cover_image'])}, "
        f"{fi}, {p['sort_order']}, {sql_str(p['timeline'])}, {sql_str(p['status'])}, "
        f"{sql_str(p['problem_heading'])}, {sql_str(p['problem_description'])}, "
        f"{sql_str(p['solution_heading'])}, {sql_str(p['solution_description'])}, "
        f"{sql_str(p['architecture_overview'])}, "
        f"{sql_str(p['testimonial_quote'])}, {sql_str(p['testimonial_author'])}, "
        f"{sql_str(p['testimonial_role'])}, {sql_str(p['testimonial_company'])});"
    )

    for j, tag in enumerate(p["tags"]):
        lines.append(f"INSERT OR IGNORE INTO case_study_tags (slug, tag, sort_order) VALUES ({sql_str(slug)}, {sql_str(tag)}, {j});")

    for j, pt in enumerate(p["pain_points"]):
        lines.append(f"INSERT OR IGNORE INTO case_study_pain_points (slug, point, sort_order) VALUES ({sql_str(slug)}, {sql_str(pt)}, {j});")

    for j, d in enumerate(p["deliverables"]):
        lines.append(f"INSERT OR IGNORE INTO case_study_deliverables (slug, deliverable, sort_order) VALUES ({sql_str(slug)}, {sql_str(d)}, {j});")

    for j, t in enumerate(p["stack"]):
        lines.append(f"INSERT OR IGNORE INTO case_study_stack (slug, tech, sort_order) VALUES ({sql_str(slug)}, {sql_str(t)}, {j});")

    for j, fs in enumerate(p["flow_steps"]):
        legacy_step = f"{fs['step']} — {fs['title']}: {fs['description']}"
        lines.append(f"INSERT OR IGNORE INTO case_study_flow_steps (slug, step, sort_order) VALUES ({sql_str(slug)}, {sql_str(legacy_step)}, {j});")

    for j, s in enumerate(p["stats"]):
        lines.append(f"INSERT OR IGNORE INTO case_study_stats (slug, label, value, sort_order) VALUES ({sql_str(slug)}, {sql_str(s['label'])}, {sql_str(s['value'])}, {j});")

    for j, b in enumerate(p["bullets"]):
        lines.append(f"INSERT OR IGNORE INTO case_study_result_bullets (slug, bullet, sort_order) VALUES ({sql_str(slug)}, {sql_str(b)}, {j});")

    for j, kf in enumerate(p["key_features"]):
        lines.append(f"INSERT OR IGNORE INTO case_study_key_features (slug, title, description, tag, sort_order) VALUES ({sql_str(slug)}, {sql_str(kf['title'])}, {sql_str(kf['description'])}, {sql_str(kf.get('tag'))}, {j});")

    lines.append("")

output_path = os.path.realpath(OUT)
migrations_path = os.path.realpath(MIGRATIONS_DIR)
if (
    os.path.commonpath([output_path, migrations_path]) == migrations_path
    or re.match(r"^\d+_", os.path.basename(output_path))
):
    raise RuntimeError("Seed output must remain outside numbered migrations")

os.makedirs(os.path.dirname(output_path), exist_ok=True)
with open(output_path, "w", encoding="utf-8", newline="\n") as f:
    f.write("\n".join(lines))

print(f"Written: {output_path}")
print(f"Lines:   {len(lines)}")
