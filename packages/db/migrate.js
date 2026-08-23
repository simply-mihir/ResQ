// Raw SQL migration script — bypasses Prisma CLI entirely
// Usage: node migrate.js
require('dotenv').config();
const { Client } = require('pg');

const SQL = `
-- Drop existing tables (in reverse dependency order) if they exist
DROP TABLE IF EXISTS "qr_scan_logs" CASCADE;
DROP TABLE IF EXISTS "audit_logs" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "follow_up_recommendations" CASCADE;
DROP TABLE IF EXISTS "medical_record_entries" CASCADE;
DROP TABLE IF EXISTS "diagnostic_centres" CASCADE;
DROP TABLE IF EXISTS "hospital_specialists" CASCADE;
DROP TABLE IF EXISTS "case_status_history" CASCADE;
DROP TABLE IF EXISTS "emergency_cases" CASCADE;
DROP TABLE IF EXISTS "ambulances" CASCADE;
DROP TABLE IF EXISTS "hospitals" CASCADE;
DROP TABLE IF EXISTS "emergency_profiles" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Drop existing enums
DROP TYPE IF EXISTS "UserRole" CASCADE;
DROP TYPE IF EXISTS "CaseStatus" CASCADE;
DROP TYPE IF EXISTS "SeverityTier" CASCADE;
DROP TYPE IF EXISTS "AmbulanceStatus" CASCADE;
DROP TYPE IF EXISTS "RecordStatus" CASCADE;
DROP TYPE IF EXISTS "FollowUpStatus" CASCADE;
DROP TYPE IF EXISTS "NotificationChannel" CASCADE;

-- Create enums
CREATE TYPE "UserRole" AS ENUM ('BYSTANDER', 'PATIENT', 'AMBULANCE', 'HOSPITAL_STAFF', 'DOCTOR', 'DIAGNOSTIC_STAFF', 'ADMIN');
CREATE TYPE "CaseStatus" AS ENUM ('TRIGGERED', 'TRIAGE_COMPLETE', 'DISPATCHED', 'EN_ROUTE_TO_PATIENT', 'AT_PATIENT', 'EN_ROUTE_TO_HOSPITAL', 'ARRIVED', 'CLOSED');
CREATE TYPE "SeverityTier" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "AmbulanceStatus" AS ENUM ('AVAILABLE', 'DISPATCHED', 'EN_ROUTE', 'BUSY', 'OFFLINE');
CREATE TYPE "RecordStatus" AS ENUM ('PROCESSING', 'AI_EXTRACTED', 'DOCTOR_REVIEWED', 'VERIFIED', 'REJECTED');
CREATE TYPE "FollowUpStatus" AS ENUM ('RECOMMENDED', 'BOOKED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "NotificationChannel" AS ENUM ('SMS', 'WHATSAPP', 'PUSH', 'EMAIL');

-- Users
CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "name" TEXT,
  "role" "UserRole" NOT NULL,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "org_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Emergency Profiles
CREATE TABLE "emergency_profiles" (
  "id" TEXT NOT NULL,
  "user_id" TEXT,
  "blood_group" TEXT,
  "allergies" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "chronic_conditions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "current_medications" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "emergency_contact_name" TEXT,
  "emergency_contact_phone" TEXT,
  "insurance_provider" TEXT,
  "insurance_policy_number" TEXT,
  "qr_token" TEXT NOT NULL,
  "consent_given_at" TIMESTAMP(3),
  "consent_version" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "emergency_profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "emergency_profiles_user_id_key" ON "emergency_profiles"("user_id");
CREATE UNIQUE INDEX "emergency_profiles_qr_token_key" ON "emergency_profiles"("qr_token");
ALTER TABLE "emergency_profiles" ADD CONSTRAINT "emergency_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Hospitals
CREATE TABLE "hospitals" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "location_lat" DOUBLE PRECISION NOT NULL,
  "location_lng" DOUBLE PRECISION NOT NULL,
  "address" TEXT,
  "phone" TEXT,
  "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "trauma_capable" BOOLEAN NOT NULL DEFAULT false,
  "bed_capacity_total" INTEGER NOT NULL,
  "bed_capacity_free" INTEGER NOT NULL,
  "bed_updated_at" TIMESTAMP(3),
  "verified_partner" BOOLEAN NOT NULL DEFAULT false,
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hospitals_pkey" PRIMARY KEY ("id")
);

-- Hospital Specialists
CREATE TABLE "hospital_specialists" (
  "id" TEXT NOT NULL,
  "hospital_id" TEXT NOT NULL,
  "specialty" TEXT NOT NULL,
  "available" BOOLEAN NOT NULL DEFAULT true,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hospital_specialists_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "hospital_specialists" ADD CONSTRAINT "hospital_specialists_hospital_id_fkey" FOREIGN KEY ("hospital_id") REFERENCES "hospitals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Ambulances
CREATE TABLE "ambulances" (
  "id" TEXT NOT NULL,
  "vehicle_number" TEXT NOT NULL,
  "operator_org_id" TEXT,
  "status" "AmbulanceStatus" NOT NULL DEFAULT 'OFFLINE',
  "current_lat" DOUBLE PRECISION,
  "current_lng" DOUBLE PRECISION,
  "location_updated_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ambulances_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ambulances_vehicle_number_key" ON "ambulances"("vehicle_number");

-- Emergency Cases
CREATE TABLE "emergency_cases" (
  "id" TEXT NOT NULL,
  "case_number" TEXT NOT NULL,
  "status" "CaseStatus" NOT NULL DEFAULT 'TRIGGERED',
  "patient_id" TEXT,
  "emergency_profile_id" TEXT,
  "triggered_by_user_id" TEXT,
  "location_lat" DOUBLE PRECISION NOT NULL,
  "location_lng" DOUBLE PRECISION NOT NULL,
  "location_accuracy" DOUBLE PRECISION,
  "location_address" TEXT,
  "triage_data" JSONB,
  "severity_tier" "SeverityTier",
  "severity_score" INTEGER,
  "assigned_hospital_id" TEXT,
  "assigned_ambulance_id" TEXT,
  "hospital_match_score" DOUBLE PRECISION,
  "hospital_match_breakdown" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dispatched_at" TIMESTAMP(3),
  "hospital_alerted_at" TIMESTAMP(3),
  "hospital_acknowledged_at" TIMESTAMP(3),
  "arrived_at" TIMESTAMP(3),
  "closed_at" TIMESTAMP(3),
  "eta_minutes" INTEGER,
  "family_token" TEXT,
  "family_token_expires_at" TIMESTAMP(3),
  CONSTRAINT "emergency_cases_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "emergency_cases_case_number_key" ON "emergency_cases"("case_number");
CREATE UNIQUE INDEX "emergency_cases_family_token_key" ON "emergency_cases"("family_token");
ALTER TABLE "emergency_cases" ADD CONSTRAINT "emergency_cases_emergency_profile_id_fkey" FOREIGN KEY ("emergency_profile_id") REFERENCES "emergency_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "emergency_cases" ADD CONSTRAINT "emergency_cases_triggered_by_user_id_fkey" FOREIGN KEY ("triggered_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "emergency_cases" ADD CONSTRAINT "emergency_cases_assigned_hospital_id_fkey" FOREIGN KEY ("assigned_hospital_id") REFERENCES "hospitals"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "emergency_cases" ADD CONSTRAINT "emergency_cases_assigned_ambulance_id_fkey" FOREIGN KEY ("assigned_ambulance_id") REFERENCES "ambulances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Case Status History
CREATE TABLE "case_status_history" (
  "id" TEXT NOT NULL,
  "case_id" TEXT NOT NULL,
  "from_status" "CaseStatus" NOT NULL,
  "to_status" "CaseStatus" NOT NULL,
  "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "changed_by" TEXT,
  "notes" TEXT,
  CONSTRAINT "case_status_history_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "case_status_history" ADD CONSTRAINT "case_status_history_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "emergency_cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Medical Record Entries
CREATE TABLE "medical_record_entries" (
  "id" TEXT NOT NULL,
  "patient_id" TEXT NOT NULL,
  "source_document_url" TEXT,
  "document_type" TEXT,
  "extracted_data" JSONB,
  "extraction_confidence" DOUBLE PRECISION,
  "low_confidence_fields" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "status" "RecordStatus" NOT NULL DEFAULT 'PROCESSING',
  "reviewed_by_doctor_id" TEXT,
  "reviewed_at" TIMESTAMP(3),
  "edit_history" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "medical_record_entries_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "medical_record_entries" ADD CONSTRAINT "medical_record_entries_reviewed_by_doctor_id_fkey" FOREIGN KEY ("reviewed_by_doctor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Follow Up Recommendations
CREATE TABLE "follow_up_recommendations" (
  "id" TEXT NOT NULL,
  "case_id" TEXT,
  "patient_id" TEXT NOT NULL,
  "recommended_test" TEXT NOT NULL,
  "urgency" TEXT,
  "notes" TEXT,
  "recommending_doctor_id" TEXT NOT NULL,
  "diagnostic_centre_id" TEXT,
  "status" "FollowUpStatus" NOT NULL DEFAULT 'RECOMMENDED',
  "booked_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "follow_up_recommendations_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "follow_up_recommendations" ADD CONSTRAINT "follow_up_recommendations_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "emergency_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "follow_up_recommendations" ADD CONSTRAINT "follow_up_recommendations_recommending_doctor_id_fkey" FOREIGN KEY ("recommending_doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Diagnostic Centres
CREATE TABLE "diagnostic_centres" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "location_lat" DOUBLE PRECISION NOT NULL,
  "location_lng" DOUBLE PRECISION NOT NULL,
  "address" TEXT,
  "phone" TEXT,
  "available_tests" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "avg_wait_minutes" INTEGER,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "diagnostic_centres_pkey" PRIMARY KEY ("id")
);

-- Notifications
CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "case_id" TEXT,
  "recipient" TEXT NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "content" TEXT NOT NULL,
  "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "delivered_at" TIMESTAMP(3),
  "failed_at" TIMESTAMP(3),
  "fail_reason" TEXT,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "emergency_cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Audit Logs
CREATE TABLE "audit_logs" (
  "id" TEXT NOT NULL,
  "actor_user_id" TEXT,
  "actor_role" TEXT,
  "action" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "metadata" JSONB,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs"("actor_user_id");
CREATE INDEX "audit_logs_timestamp_idx" ON "audit_logs"("timestamp");
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- QR Scan Logs
CREATE TABLE "qr_scan_logs" (
  "id" TEXT NOT NULL,
  "patient_id" TEXT,
  "scanned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "resolved_fields" TEXT[] DEFAULT ARRAY[]::TEXT[],
  CONSTRAINT "qr_scan_logs_pkey" PRIMARY KEY ("id")
);

-- Prisma migration tracking (so Prisma Client knows schema is in sync)
CREATE TABLE IF NOT "_prisma_migrations" (
  "id" VARCHAR(36) NOT NULL,
  "checksum" VARCHAR(64) NOT NULL,
  "finished_at" TIMESTAMP(3) WITH TIME ZONE,
  "migration_name" VARCHAR(255) NOT NULL,
  "logs" TEXT,
  "rolled_back_at" TIMESTAMP(3) WITH TIME ZONE,
  "started_at" TIMESTAMP(3) WITH TIME ZONE NOT NULL DEFAULT now(),
  "applied_steps_count" INT NOT NULL DEFAULT 0,
  CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);
`;

async function run() {
  const url = process.env.DIRECT_URL;
  if (!url) {
    console.error('DIRECT_URL not set in .env');
    process.exit(1);
  }

  console.log('Connecting to database...');
  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

  try {
    await client.connect();
    console.log('Connected. Running migration...');
    await client.query(SQL);
    console.log('Schema created successfully!');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
