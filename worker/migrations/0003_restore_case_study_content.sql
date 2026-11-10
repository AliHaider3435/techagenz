-- Migration 0003 — Restore Case Study content and structure
-- Adds forward-compatible fields while retaining legacy flow step text.

ALTER TABLE case_study_stats
  ADD COLUMN context TEXT NOT NULL DEFAULT '';

ALTER TABLE case_study_flow_steps
  ADD COLUMN step_code TEXT NOT NULL DEFAULT '';

ALTER TABLE case_study_flow_steps
  ADD COLUMN title TEXT NOT NULL DEFAULT '';

ALTER TABLE case_study_flow_steps
  ADD COLUMN description TEXT NOT NULL DEFAULT '';

UPDATE case_studies
SET solution_description = 'Tech Agenz designed and engineered a bespoke, secure legal technology portal tailored to the chamber''s practice hierarchy. The platform incorporates structured case intake forms with preliminary fact gathering, automated appointment booking synced to advocate calendars, and authoritative practice directories that present credentials with institutional prestige. Deployed on modern server-rendered infrastructure with sub-second page loads and strict privacy protocols.'
WHERE slug = 'garwan-law-chamber';

UPDATE case_studies
SET solution_description = 'We built a tailored medical portal with 15-minute slot allocation, intelligent patient symptom intake questionnaires, and automated clinic confirmation notifications. The system features a doctor control panel to view expected patient volumes, mark completed consultations, and seamlessly reschedule appointments with one click. Hospital staff access a dedicated receptionist view to manage check-ins instantly.'
WHERE slug = 'dr-sajid-sohail';

UPDATE case_study_stats SET context = 'Decrease in waiting room overcrowding'
WHERE slug = 'dr-iqbal-kharal' AND sort_order = 0;
UPDATE case_study_stats SET context = 'Atomic database locking eliminated all collisions'
WHERE slug = 'dr-iqbal-kharal' AND sort_order = 1;
UPDATE case_study_stats SET context = 'Staff inquiry workload dropped during peak hours'
WHERE slug = 'dr-iqbal-kharal' AND sort_order = 2;
UPDATE case_study_stats SET context = 'Staff hours redirected from calls to in-clinic care'
WHERE slug = 'dr-iqbal-kharal' AND sort_order = 3;

UPDATE case_study_stats SET context = 'Reduction in initial consultation administrative coordination'
WHERE slug = 'garwan-law-chamber' AND sort_order = 0;
UPDATE case_study_stats SET context = 'Sub-second speed on mobile and desktop devices'
WHERE slug = 'garwan-law-chamber' AND sort_order = 1;
UPDATE case_study_stats SET context = 'Secure upfront briefs preserving legal privilege'
WHERE slug = 'garwan-law-chamber' AND sort_order = 2;
UPDATE case_study_stats SET context = 'Handled through structured digital intake'
WHERE slug = 'garwan-law-chamber' AND sort_order = 3;

UPDATE case_study_stats SET context = 'Down from 15% via automated pre-visit reminders'
WHERE slug = 'dr-sajid-sohail' AND sort_order = 0;
UPDATE case_study_stats SET context = 'Pre-filled medical intake saves doctor time'
WHERE slug = 'dr-sajid-sohail' AND sort_order = 1;
UPDATE case_study_stats SET context = 'Increase in verified monthly patient consultations'
WHERE slug = 'dr-sajid-sohail' AND sort_order = 2;
UPDATE case_study_stats SET context = 'Instantaneous access to appointment history'
WHERE slug = 'dr-sajid-sohail' AND sort_order = 3;

UPDATE case_study_flow_steps
SET step_code = '01', title = 'Slot Selection',
    description = 'Patient selects available consultation slot from real-time calendar.'
WHERE slug = 'dr-iqbal-kharal' AND sort_order = 0;
UPDATE case_study_flow_steps
SET step_code = '02', title = 'Atomic Lock & Reservation',
    description = 'Database enforces row-level locking to prevent concurrent booking conflicts.'
WHERE slug = 'dr-iqbal-kharal' AND sort_order = 1;
UPDATE case_study_flow_steps
SET step_code = '03', title = 'Automated WhatsApp Confirmation',
    description = 'Instant booking confirmation and token number dispatched to patient''s phone.'
WHERE slug = 'dr-iqbal-kharal' AND sort_order = 2;
UPDATE case_study_flow_steps
SET step_code = '04', title = 'Live Queue Dashboard',
    description = 'Clinic receptionist tracks check-ins and physician views live consultation queue.'
WHERE slug = 'dr-iqbal-kharal' AND sort_order = 3;

UPDATE case_study_flow_steps
SET step_code = '01', title = 'Client Intake Submission',
    description = 'Prospective litigant selects legal domain and submits case details.'
WHERE slug = 'garwan-law-chamber' AND sort_order = 0;
UPDATE case_study_flow_steps
SET step_code = '02', title = 'Advocate Availability Check',
    description = 'System verifies advocate availability and avoids scheduling overlaps.'
WHERE slug = 'garwan-law-chamber' AND sort_order = 1;
UPDATE case_study_flow_steps
SET step_code = '03', title = 'Confidential Case Brief',
    description = 'Case summary organized into attorney calendar with preliminary facts.'
WHERE slug = 'garwan-law-chamber' AND sort_order = 2;
UPDATE case_study_flow_steps
SET step_code = '04', title = 'Consultation Confirmation',
    description = 'Client receives scheduled consultation details and conference instructions.'
WHERE slug = 'garwan-law-chamber' AND sort_order = 3;

UPDATE case_study_flow_steps
SET step_code = '01', title = '15-Minute Slot Booking',
    description = 'Patient reserves consultation slot according to daily session capacity.'
WHERE slug = 'dr-sajid-sohail' AND sort_order = 0;
UPDATE case_study_flow_steps
SET step_code = '02', title = 'Digital Symptom Intake',
    description = 'Patient completes brief symptom questionnaire before consultation.'
WHERE slug = 'dr-sajid-sohail' AND sort_order = 1;
UPDATE case_study_flow_steps
SET step_code = '03', title = 'Reception Check-In',
    description = 'Hospital receptionist marks patient arrival with one click.'
WHERE slug = 'dr-sajid-sohail' AND sort_order = 2;
UPDATE case_study_flow_steps
SET step_code = '04', title = 'Doctor Consultation View',
    description = 'Doctor accesses pre-filled brief and records follow-up instructions.'
WHERE slug = 'dr-sajid-sohail' AND sort_order = 3;
