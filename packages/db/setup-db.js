// setup-db.js — Combined schema migration + seed data for the Health platform
// Usage: node setup-db.js
// Requires: pg, dotenv

require('dotenv').config();
const { Client } = require('pg');

// ─── Date helpers ────────────────────────────────────────────────────────────
const daysAgo   = (n) => new Date(Date.now() - n * 86400000);
const hoursAgo  = (n) => new Date(Date.now() - n * 3600000);
const minutesAgo = (n) => new Date(Date.now() - n * 60000);

const ts = (d) => d.toISOString();

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log('✓ Connected to database\n');

  try {
    await client.query('BEGIN');

    // ═══════════════════════════════════════════════════════════════════════════
    // 1. DROP everything
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('--- Dropping existing tables & enums ---');

    await client.query(`
      DROP TABLE IF EXISTS qr_scan_logs CASCADE;
      DROP TABLE IF EXISTS audit_logs CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS follow_up_recommendations CASCADE;
      DROP TABLE IF EXISTS diagnostic_centres CASCADE;
      DROP TABLE IF EXISTS case_status_history CASCADE;
      DROP TABLE IF EXISTS medical_record_entries CASCADE;
      DROP TABLE IF EXISTS emergency_cases CASCADE;
      DROP TABLE IF EXISTS ambulances CASCADE;
      DROP TABLE IF EXISTS hospital_specialists CASCADE;
      DROP TABLE IF EXISTS hospitals CASCADE;
      DROP TABLE IF EXISTS emergency_profiles CASCADE;
      DROP TABLE IF EXISTS users CASCADE;

      DROP TYPE IF EXISTS "NotificationChannel" CASCADE;
      DROP TYPE IF EXISTS "FollowUpStatus" CASCADE;
      DROP TYPE IF EXISTS "RecordStatus" CASCADE;
      DROP TYPE IF EXISTS "AmbulanceStatus" CASCADE;
      DROP TYPE IF EXISTS "SeverityTier" CASCADE;
      DROP TYPE IF EXISTS "CaseStatus" CASCADE;
      DROP TYPE IF EXISTS "UserRole" CASCADE;
    `);
    console.log('✓ Dropped all tables and enums\n');

    // ═══════════════════════════════════════════════════════════════════════════
    // 2. CREATE enums
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('--- Creating enums ---');

    await client.query(`
      CREATE TYPE "UserRole" AS ENUM (
        'BYSTANDER','PATIENT','AMBULANCE','HOSPITAL_STAFF','DOCTOR','DIAGNOSTIC_STAFF','ADMIN'
      );
      CREATE TYPE "CaseStatus" AS ENUM (
        'TRIGGERED','TRIAGE_COMPLETE','DISPATCHED','EN_ROUTE_TO_PATIENT',
        'AT_PATIENT','EN_ROUTE_TO_HOSPITAL','ARRIVED','CLOSED'
      );
      CREATE TYPE "SeverityTier" AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');
      CREATE TYPE "AmbulanceStatus" AS ENUM ('AVAILABLE','DISPATCHED','EN_ROUTE','BUSY','OFFLINE');
      CREATE TYPE "RecordStatus" AS ENUM ('PROCESSING','AI_EXTRACTED','DOCTOR_REVIEWED','VERIFIED','REJECTED');
      CREATE TYPE "FollowUpStatus" AS ENUM ('RECOMMENDED','BOOKED','COMPLETED','CANCELLED');
      CREATE TYPE "NotificationChannel" AS ENUM ('SMS','WHATSAPP','PUSH','EMAIL');
    `);
    console.log('✓ Created all enums\n');

    // ═══════════════════════════════════════════════════════════════════════════
    // 3. CREATE tables
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('--- Creating tables ---');

    // users
    await client.query(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        phone TEXT UNIQUE,
        email TEXT UNIQUE,
        name TEXT,
        role "UserRole" NOT NULL,
        verified BOOLEAN DEFAULT false,
        org_id TEXT,
        created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ users');

    // emergency_profiles
    await client.query(`
      CREATE TABLE emergency_profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE REFERENCES users(id),
        blood_group TEXT,
        allergies TEXT[] DEFAULT '{}',
        chronic_conditions TEXT[] DEFAULT '{}',
        current_medications TEXT[] DEFAULT '{}',
        emergency_contact_name TEXT,
        emergency_contact_phone TEXT,
        insurance_provider TEXT,
        insurance_policy_number TEXT,
        qr_token TEXT NOT NULL UNIQUE,
        consent_given_at TIMESTAMP(3),
        consent_version TEXT,
        created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ emergency_profiles');

    // hospitals
    await client.query(`
      CREATE TABLE hospitals (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location_lat DOUBLE PRECISION NOT NULL,
        location_lng DOUBLE PRECISION NOT NULL,
        address TEXT,
        phone TEXT,
        specialties TEXT[] DEFAULT '{}',
        trauma_capable BOOLEAN DEFAULT false,
        bed_capacity_total INTEGER NOT NULL,
        bed_capacity_free INTEGER NOT NULL,
        bed_updated_at TIMESTAMP(3),
        verified_partner BOOLEAN DEFAULT false,
        rating DOUBLE PRECISION DEFAULT 5.0,
        created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ hospitals');

    // hospital_specialists
    await client.query(`
      CREATE TABLE hospital_specialists (
        id TEXT PRIMARY KEY,
        hospital_id TEXT NOT NULL REFERENCES hospitals(id),
        specialty TEXT NOT NULL,
        available BOOLEAN DEFAULT true,
        updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ hospital_specialists');

    // ambulances
    await client.query(`
      CREATE TABLE ambulances (
        id TEXT PRIMARY KEY,
        vehicle_number TEXT NOT NULL UNIQUE,
        operator_org_id TEXT,
        status "AmbulanceStatus" DEFAULT 'OFFLINE',
        current_lat DOUBLE PRECISION,
        current_lng DOUBLE PRECISION,
        location_updated_at TIMESTAMP(3),
        created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ ambulances');

    // emergency_cases
    await client.query(`
      CREATE TABLE emergency_cases (
        id TEXT PRIMARY KEY,
        case_number TEXT NOT NULL UNIQUE,
        status "CaseStatus" DEFAULT 'TRIGGERED',
        patient_id TEXT,
        emergency_profile_id TEXT REFERENCES emergency_profiles(id),
        triggered_by_user_id TEXT REFERENCES users(id),
        location_lat DOUBLE PRECISION NOT NULL,
        location_lng DOUBLE PRECISION NOT NULL,
        location_accuracy DOUBLE PRECISION,
        location_address TEXT,
        triage_data JSONB,
        severity_tier "SeverityTier",
        severity_score INTEGER,
        assigned_hospital_id TEXT REFERENCES hospitals(id),
        assigned_ambulance_id TEXT REFERENCES ambulances(id),
        hospital_match_score DOUBLE PRECISION,
        hospital_match_breakdown JSONB,
        created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        dispatched_at TIMESTAMP(3),
        hospital_alerted_at TIMESTAMP(3),
        hospital_acknowledged_at TIMESTAMP(3),
        arrived_at TIMESTAMP(3),
        closed_at TIMESTAMP(3),
        eta_minutes INTEGER,
        family_token TEXT UNIQUE,
        family_token_expires_at TIMESTAMP(3)
      );
    `);
    console.log('  ✓ emergency_cases');

    // case_status_history
    await client.query(`
      CREATE TABLE case_status_history (
        id TEXT PRIMARY KEY,
        case_id TEXT NOT NULL REFERENCES emergency_cases(id),
        from_status "CaseStatus" NOT NULL,
        to_status "CaseStatus" NOT NULL,
        changed_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        changed_by TEXT,
        notes TEXT
      );
    `);
    console.log('  ✓ case_status_history');

    // medical_record_entries
    await client.query(`
      CREATE TABLE medical_record_entries (
        id TEXT PRIMARY KEY,
        patient_id TEXT NOT NULL,
        source_document_url TEXT,
        document_type TEXT,
        extracted_data JSONB,
        extraction_confidence DOUBLE PRECISION,
        low_confidence_fields TEXT[] DEFAULT '{}',
        status "RecordStatus" DEFAULT 'PROCESSING',
        reviewed_by_doctor_id TEXT REFERENCES users(id),
        reviewed_at TIMESTAMP(3),
        edit_history JSONB,
        created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ medical_record_entries');

    // follow_up_recommendations
    await client.query(`
      CREATE TABLE follow_up_recommendations (
        id TEXT PRIMARY KEY,
        case_id TEXT REFERENCES emergency_cases(id),
        patient_id TEXT NOT NULL,
        recommended_test TEXT NOT NULL,
        urgency TEXT,
        notes TEXT,
        recommending_doctor_id TEXT NOT NULL REFERENCES users(id),
        diagnostic_centre_id TEXT,
        status "FollowUpStatus" DEFAULT 'RECOMMENDED',
        booked_at TIMESTAMP(3),
        completed_at TIMESTAMP(3),
        created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ follow_up_recommendations');

    // diagnostic_centres
    await client.query(`
      CREATE TABLE diagnostic_centres (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location_lat DOUBLE PRECISION NOT NULL,
        location_lng DOUBLE PRECISION NOT NULL,
        address TEXT,
        phone TEXT,
        available_tests TEXT[] DEFAULT '{}',
        avg_wait_minutes INTEGER,
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('  ✓ diagnostic_centres');

    // notifications
    await client.query(`
      CREATE TABLE notifications (
        id TEXT PRIMARY KEY,
        case_id TEXT REFERENCES emergency_cases(id),
        recipient TEXT NOT NULL,
        channel "NotificationChannel" NOT NULL,
        content TEXT NOT NULL,
        sent_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        delivered_at TIMESTAMP(3),
        failed_at TIMESTAMP(3),
        fail_reason TEXT
      );
    `);
    console.log('  ✓ notifications');

    // audit_logs
    await client.query(`
      CREATE TABLE audit_logs (
        id TEXT PRIMARY KEY,
        actor_user_id TEXT REFERENCES users(id),
        actor_role TEXT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT NOT NULL,
        metadata JSONB,
        timestamp TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_audit_logs_entity ON audit_logs (entity_type, entity_id);
      CREATE INDEX idx_audit_logs_actor ON audit_logs (actor_user_id);
      CREATE INDEX idx_audit_logs_timestamp ON audit_logs (timestamp);
    `);
    console.log('  ✓ audit_logs (with indexes)');

    // qr_scan_logs
    await client.query(`
      CREATE TABLE qr_scan_logs (
        id TEXT PRIMARY KEY,
        patient_id TEXT,
        scanned_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        resolved_fields TEXT[] DEFAULT '{}'
      );
    `);
    console.log('  ✓ qr_scan_logs');

    console.log('\n✓ All tables created\n');

    // ═══════════════════════════════════════════════════════════════════════════
    // 4. SEED DATA
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('--- Inserting seed data ---');

    // ── Users ────────────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO users (id, phone, email, name, role, verified, org_id) VALUES
        ('u-mihir-001',        '+919876543210', 'mihircodes20@gmail.com',  'Mihir',            'PATIENT',        true, NULL),
        ('u-prachi-002',       '+919876543211', 'prachi.7haa@gmail.com',  'Prachi',           'PATIENT',        true, NULL),
        ('u-staff-apollo-003', '+919800000001', 'prateekraushan00@gmail.com','Ramesh Nair',      'HOSPITAL_STAFF', true, 'h-apollo-001'),
        ('u-staff-fortis-004', '+919800000002', 'staff.fortis@health.com','Sunita Desai',     'HOSPITAL_STAFF', true, 'h-fortis-002'),
        ('u-dr-kapoor-005',    '+919800000003', '124cs0082@iiitk.ac.in',   'Dr. Arun Kapoor',  'DOCTOR',         true, 'h-apollo-001'),
        ('u-dr-mehta-006',     '+919800000004', 'dr.mehta@health.com',    'Dr. Priya Mehta',  'DOCTOR',         true, 'h-nanavati-003'),
        ('u-ambulance-007',    '+919800000005', 'amb.vikram@health.com',  'Vikram Patil',     'AMBULANCE',      true, NULL),
        ('u-ambulance-008',    '+919800000006', 'amb.suresh@health.com',  'Suresh Yadav',     'AMBULANCE',      true, NULL),
        ('u-admin-009',        '+919800000007', 'admin@health.com',       'Admin',            'ADMIN',          true, NULL);
    `);
    console.log('  ✓ 9 users');

    // ── Emergency Profiles ───────────────────────────────────────────────────
    await client.query(`
      INSERT INTO emergency_profiles (
        id, user_id, blood_group, allergies, chronic_conditions, current_medications,
        emergency_contact_name, emergency_contact_phone,
        insurance_provider, insurance_policy_number,
        qr_token, consent_given_at, consent_version
      ) VALUES
        (
          'ep-mihir-001', 'u-mihir-001', 'O+',
          ARRAY['Penicillin','Dust']::TEXT[],
          ARRAY['Mild Asthma']::TEXT[],
          ARRAY['Salbutamol Inhaler']::TEXT[],
          'Ravi Sharma', '+919812345678',
          'Star Health', 'SH-MUM-2024-88421',
          'mihir-health-qr-2024',
          '${ts(daysAgo(200))}', '1.0'
        ),
        (
          'ep-prachi-002', 'u-prachi-002', 'B+',
          ARRAY['Sulfa Drugs']::TEXT[],
          ARRAY['Hypothyroidism']::TEXT[],
          ARRAY['Levothyroxine 50mcg']::TEXT[],
          'Sneha Thakur', '+919898765432',
          'HDFC Ergo', 'HE-MUM-2024-76553',
          'prachi-health-qr-2024',
          '${ts(daysAgo(180))}', '1.0'
        );
    `);
    console.log('  ✓ 2 emergency profiles');

    // ── Hospitals ────────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO hospitals (
        id, name, location_lat, location_lng, specialties,
        trauma_capable, bed_capacity_total, bed_capacity_free, verified_partner, rating
      ) VALUES
        ('h-apollo-001',       'Apollo Hospital Mumbai',                    19.0596, 72.8295, ARRAY['cardiology','neurology','orthopedics','general','trauma_surgery','oncology']::TEXT[],                              true,  250, 34, true, 4.7),
        ('h-fortis-002',       'Fortis Hospital Mulund',                    19.1726, 72.9569, ARRAY['cardiology','orthopedics','general','pediatrics','gastroenterology']::TEXT[],                                      true,  200, 28, true, 4.5),
        ('h-nanavati-003',     'Nanavati Super Speciality Hospital',        19.0984, 72.8367, ARRAY['cardiology','neurology','orthopedics','general','nephrology','pulmonology']::TEXT[],                               true,  300, 45, true, 4.6),
        ('h-lilavati-004',     'Lilavati Hospital',                         19.0509, 72.8294, ARRAY['cardiology','neurology','orthopedics','general','trauma_surgery','urology']::TEXT[],                               true,  200, 18, true, 4.8),
        ('h-kem-005',          'KEM Hospital',                              19.0007, 72.8422, ARRAY['general','trauma_surgery','emergency_medicine','orthopedics','neurology','pulmonology']::TEXT[],                    true,  280, 12, true, 4.2),
        ('h-hinduja-006',      'Hinduja Hospital',                          19.0380, 72.8430, ARRAY['cardiology','neurology','gastroenterology','nephrology','general']::TEXT[],                                        true,  180, 22, true, 4.6),
        ('h-breach-candy-007', 'Breach Candy Hospital',                     18.9716, 72.8052, ARRAY['cardiology','general','orthopedics','ENT','dermatology']::TEXT[],                                                  false, 150, 15, true, 4.5),
        ('h-jaslok-008',       'Jaslok Hospital',                           18.9706, 72.8073, ARRAY['cardiology','neurology','orthopedics','general','oncology']::TEXT[],                                               false, 170, 20, true, 4.4),
        ('h-bombay-009',       'Bombay Hospital',                           18.9485, 72.8277, ARRAY['cardiology','neurology','orthopedics','general','trauma_surgery','emergency_medicine','pulmonology']::TEXT[],       true,  260, 30, true, 4.3),
        ('h-kokilaben-010',    'Kokilaben Dhirubhai Ambani Hospital',       19.1310, 72.8269, ARRAY['cardiology','neurology','orthopedics','general','trauma_surgery','oncology','nephrology','urology']::TEXT[],        true,  300, 40, true, 4.9),
        ('h-wockhardt-011',    'Wockhardt Hospital',                        19.0170, 72.8561, ARRAY['cardiology','orthopedics','general','gastroenterology']::TEXT[],                                                   false, 120, 10, true, 4.1),
        ('h-seven-hills-012',  'Seven Hills Hospital',                      19.1077, 72.8674, ARRAY['cardiology','orthopedics','general','emergency_medicine','pulmonology']::TEXT[],                                   true,  180, 25, true, 4.0),
        ('h-global-013',       'Global Hospital',                           19.0990, 72.8868, ARRAY['nephrology','urology','general','gastroenterology']::TEXT[],                                                       false, 100,  8, true, 4.2),
        ('h-reliance-014',     'Sir HN Reliance Foundation Hospital',       18.9870, 72.8331, ARRAY['cardiology','neurology','orthopedics','general','trauma_surgery','oncology','emergency_medicine']::TEXT[],          true,  220, 32, true, 4.7),
        ('h-tata-015',         'Tata Memorial Hospital',                    19.0037, 72.8426, ARRAY['oncology','general','pulmonology']::TEXT[],                                                                        false, 200,  5, true, 4.8),
        ('h-hiranandani-016',  'Hiranandani Hospital Powai',                19.1197, 72.9074, ARRAY['orthopedics','general','pediatrics','ENT','dermatology','emergency_medicine']::TEXT[],                              true,  160, 20, true, 4.4),
        ('h-jupiter-017',      'Jupiter Hospital Thane',                    19.2094, 72.9737, ARRAY['cardiology','neurology','orthopedics','general','trauma_surgery','gastroenterology']::TEXT[],                       true,  220, 35, true, 4.5),
        ('h-asian-heart-018',  'Asian Heart Institute',                     19.0487, 72.8290, ARRAY['cardiology','general']::TEXT[],                                                                                    false,  80, 12, true, 4.9),
        ('h-saifee-019',       'Saifee Hospital',                           18.9616, 72.8128, ARRAY['orthopedics','general','psychiatry','ENT','urology']::TEXT[],                                                      false, 140, 16, true, 4.3),
        ('h-holy-spirit-020',  'Holy Spirit Hospital',                      19.1061, 72.8369, ARRAY['general','pediatrics','orthopedics','dermatology']::TEXT[],                                                        false, 120, 14, true, 3.9);
    `);
    console.log('  ✓ 20 hospitals');

    // ── Hospital Specialists ─────────────────────────────────────────────────
    await client.query(`
      INSERT INTO hospital_specialists (id, hospital_id, specialty, available) VALUES
        -- Apollo (hs-001 to hs-004)
        ('hs-001', 'h-apollo-001',       'cardiology',        true),
        ('hs-002', 'h-apollo-001',       'neurology',         true),
        ('hs-003', 'h-apollo-001',       'trauma_surgery',    true),
        ('hs-004', 'h-apollo-001',       'general',           true),
        -- Fortis (hs-005 to hs-007)
        ('hs-005', 'h-fortis-002',       'cardiology',        true),
        ('hs-006', 'h-fortis-002',       'orthopedics',       true),
        ('hs-007', 'h-fortis-002',       'general',           true),
        -- Nanavati (hs-008 to hs-010)
        ('hs-008', 'h-nanavati-003',     'neurology',         true),
        ('hs-009', 'h-nanavati-003',     'nephrology',        true),
        ('hs-010', 'h-nanavati-003',     'pulmonology',       false),
        -- Lilavati (hs-011 to hs-013)
        ('hs-011', 'h-lilavati-004',     'cardiology',        true),
        ('hs-012', 'h-lilavati-004',     'trauma_surgery',    true),
        ('hs-013', 'h-lilavati-004',     'urology',           true),
        -- KEM (hs-014 to hs-016)
        ('hs-014', 'h-kem-005',          'trauma_surgery',    true),
        ('hs-015', 'h-kem-005',          'emergency_medicine',true),
        ('hs-016', 'h-kem-005',          'general',           true),
        -- Hinduja (hs-017 to hs-018)
        ('hs-017', 'h-hinduja-006',      'gastroenterology',  true),
        ('hs-018', 'h-hinduja-006',      'nephrology',        true),
        -- Breach Candy (hs-019 to hs-020)
        ('hs-019', 'h-breach-candy-007', 'cardiology',        false),
        ('hs-020', 'h-breach-candy-007', 'ENT',               true),
        -- Jaslok (hs-021 to hs-022)
        ('hs-021', 'h-jaslok-008',       'neurology',         true),
        ('hs-022', 'h-jaslok-008',       'oncology',          true),
        -- Bombay (hs-023 to hs-025)
        ('hs-023', 'h-bombay-009',       'trauma_surgery',    true),
        ('hs-024', 'h-bombay-009',       'emergency_medicine',true),
        ('hs-025', 'h-bombay-009',       'pulmonology',       true),
        -- Kokilaben (hs-026 to hs-029)
        ('hs-026', 'h-kokilaben-010',    'cardiology',        true),
        ('hs-027', 'h-kokilaben-010',    'neurology',         true),
        ('hs-028', 'h-kokilaben-010',    'trauma_surgery',    true),
        ('hs-029', 'h-kokilaben-010',    'oncology',          false),
        -- Wockhardt (hs-030 to hs-031)
        ('hs-030', 'h-wockhardt-011',    'cardiology',        true),
        ('hs-031', 'h-wockhardt-011',    'gastroenterology',  true),
        -- Seven Hills (hs-032 to hs-033)
        ('hs-032', 'h-seven-hills-012',  'emergency_medicine',true),
        ('hs-033', 'h-seven-hills-012',  'pulmonology',       false),
        -- Global (hs-034 to hs-035)
        ('hs-034', 'h-global-013',       'nephrology',        true),
        ('hs-035', 'h-global-013',       'urology',           true),
        -- Reliance (hs-036 to hs-038)
        ('hs-036', 'h-reliance-014',     'cardiology',        true),
        ('hs-037', 'h-reliance-014',     'trauma_surgery',    true),
        ('hs-038', 'h-reliance-014',     'emergency_medicine',true),
        -- Tata Memorial (hs-039 to hs-040)
        ('hs-039', 'h-tata-015',         'oncology',          true),
        ('hs-040', 'h-tata-015',         'pulmonology',       true),
        -- Hiranandani (hs-041 to hs-043)
        ('hs-041', 'h-hiranandani-016',  'orthopedics',       true),
        ('hs-042', 'h-hiranandani-016',  'pediatrics',        true),
        ('hs-043', 'h-hiranandani-016',  'emergency_medicine',true),
        -- Jupiter (hs-044 to hs-046)
        ('hs-044', 'h-jupiter-017',      'neurology',         true),
        ('hs-045', 'h-jupiter-017',      'trauma_surgery',    true),
        ('hs-046', 'h-jupiter-017',      'gastroenterology',  false),
        -- Asian Heart (hs-047 to hs-048)
        ('hs-047', 'h-asian-heart-018',  'cardiology',        true),
        ('hs-048', 'h-asian-heart-018',  'general',           true),
        -- Saifee (hs-049 to hs-050)
        ('hs-049', 'h-saifee-019',       'psychiatry',        true),
        ('hs-050', 'h-saifee-019',       'orthopedics',       false);
    `);
    console.log('  ✓ 50 hospital specialists');

    // ── Ambulances ───────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO ambulances (id, vehicle_number, status, current_lat, current_lng, location_updated_at) VALUES
        ('amb-001', 'MH-01-AB-1234', 'DISPATCHED', 19.055,  72.831, '${ts(minutesAgo(2))}'),
        ('amb-002', 'MH-01-CD-5678', 'AVAILABLE',  19.098,  72.836, '${ts(minutesAgo(5))}'),
        ('amb-003', 'MH-01-EF-9012', 'AVAILABLE',  19.118,  72.907, '${ts(minutesAgo(8))}'),
        ('amb-004', 'MH-01-GH-3456', 'AVAILABLE',  18.998,  72.840, '${ts(minutesAgo(3))}'),
        ('amb-005', 'MH-01-IJ-7890', 'AVAILABLE',  19.131,  72.828, '${ts(minutesAgo(10))}'),
        ('amb-006', 'MH-01-KL-2345', 'AVAILABLE',  19.040,  72.843, '${ts(minutesAgo(4))}'),
        ('amb-007', 'MH-01-MN-6789', 'AVAILABLE',  19.172,  72.958, '${ts(minutesAgo(15))}'),
        ('amb-008', 'MH-01-OP-0123', 'OFFLINE',    NULL,    NULL,   NULL),
        ('amb-009', 'MH-01-QR-4567', 'AVAILABLE',  19.209,  72.975, '${ts(minutesAgo(7))}'),
        ('amb-010', 'MH-01-ST-8901', 'AVAILABLE',  18.962,  72.812, '${ts(minutesAgo(12))}');
    `);
    console.log('  ✓ 10 ambulances');

    // ── Emergency Cases ──────────────────────────────────────────────────────
    // Case 1: Closed cardiac case (Mihir)
    await client.query(`
      INSERT INTO emergency_cases (
        id, case_number, status, patient_id, emergency_profile_id, triggered_by_user_id,
        location_lat, location_lng, location_address,
        triage_data, severity_tier, severity_score,
        assigned_hospital_id, assigned_ambulance_id,
        eta_minutes, family_token,
        created_at, dispatched_at, hospital_alerted_at, hospital_acknowledged_at, arrived_at, closed_at
      ) VALUES (
        'ec-closed-001', 'HC-2024-10001', 'CLOSED',
        'u-mihir-001', 'ep-mihir-001', 'u-mihir-001',
        19.076, 72.8777,
        'Andheri Station Road, Near Metro Station, Mumbai 400058',
        '{"conscious":true,"breathing":false,"bleeding":false,"situationType":"cardiac"}'::JSONB,
        'HIGH', 8,
        'h-kem-005', 'amb-001',
        12, 'ft-mihir-case1-20240322',
        '${ts(daysAgo(152))}',
        '${ts(new Date(daysAgo(152).getTime() + 3 * 60000))}',
        '${ts(new Date(daysAgo(152).getTime() + 4 * 60000))}',
        '${ts(new Date(daysAgo(152).getTime() + 5 * 60000))}',
        '${ts(new Date(daysAgo(152).getTime() + 15 * 60000))}',
        '${ts(new Date(daysAgo(152).getTime() + 180 * 60000))}'
      );
    `);

    // Case 2: Closed accident case (Prachi)
    await client.query(`
      INSERT INTO emergency_cases (
        id, case_number, status, patient_id, emergency_profile_id, triggered_by_user_id,
        location_lat, location_lng,
        triage_data, severity_tier, severity_score,
        assigned_hospital_id, assigned_ambulance_id,
        family_token,
        created_at, dispatched_at, hospital_alerted_at, hospital_acknowledged_at, arrived_at, closed_at
      ) VALUES (
        'ec-closed-002', 'HC-2024-10042', 'CLOSED',
        'u-prachi-002', 'ep-prachi-002', 'u-prachi-002',
        19.118, 72.905,
        '{"conscious":true,"breathing":true,"bleeding":true,"situationType":"accident"}'::JSONB,
        'HIGH', 8,
        'h-hiranandani-016', 'amb-003',
        'ft-prachi-case2-20240501',
        '${ts(daysAgo(114))}',
        '${ts(new Date(daysAgo(114).getTime() + 4 * 60000))}',
        '${ts(new Date(daysAgo(114).getTime() + 5 * 60000))}',
        '${ts(new Date(daysAgo(114).getTime() + 6 * 60000))}',
        '${ts(new Date(daysAgo(114).getTime() + 18 * 60000))}',
        '${ts(new Date(daysAgo(114).getTime() + 240 * 60000))}'
      );
    `);

    // Case 3: Dispatched cardiac case (Mihir — active)
    await client.query(`
      INSERT INTO emergency_cases (
        id, case_number, status, patient_id, emergency_profile_id, triggered_by_user_id,
        location_lat, location_lng, location_address,
        triage_data, severity_tier, severity_score,
        assigned_hospital_id, assigned_ambulance_id,
        eta_minutes, family_token,
        created_at, dispatched_at, hospital_alerted_at
      ) VALUES (
        'ec-dispatched-003', 'HC-2024-10187', 'DISPATCHED',
        'u-mihir-001', 'ep-mihir-001', 'u-mihir-001',
        19.044, 72.82,
        'Carter Road, Bandra West, Mumbai 400050',
        '{"conscious":true,"breathing":false,"bleeding":false,"situationType":"cardiac"}'::JSONB,
        'HIGH', 8,
        'h-lilavati-004', 'amb-001',
        8, 'ft-mihir-case3-active',
        '${ts(minutesAgo(25))}',
        '${ts(minutesAgo(22))}',
        '${ts(minutesAgo(21))}'
      );
    `);

    // Case 4: Triggered unknown case (Prachi — just triggered)
    await client.query(`
      INSERT INTO emergency_cases (
        id, case_number, status, patient_id, emergency_profile_id, triggered_by_user_id,
        location_lat, location_lng,
        triage_data, severity_tier, severity_score,
        family_token,
        created_at
      ) VALUES (
        'ec-triggered-004', 'HC-2024-10188', 'TRIGGERED',
        'u-prachi-002', 'ep-prachi-002', 'u-prachi-002',
        19.107, 72.837,
        '{"conscious":true,"breathing":true,"bleeding":false,"situationType":"unknown"}'::JSONB,
        'LOW', 2,
        'ft-prachi-case4-triggered',
        '${ts(minutesAgo(5))}'
      );
    `);
    console.log('  ✓ 4 emergency cases');

    // ── Case Status History ──────────────────────────────────────────────────
    await client.query(`
      INSERT INTO case_status_history (id, case_id, from_status, to_status, changed_at, changed_by, notes) VALUES
        -- Case 1 lifecycle (ec-closed-001)
        ('csh-01a', 'ec-closed-001', 'TRIGGERED',            'TRIAGE_COMPLETE',       '${ts(new Date(daysAgo(152).getTime() + 1 * 60000))}',  'system',          'AI triage completed'),
        ('csh-01b', 'ec-closed-001', 'TRIAGE_COMPLETE',       'DISPATCHED',            '${ts(new Date(daysAgo(152).getTime() + 3 * 60000))}',  'system',          'Ambulance amb-001 dispatched'),
        ('csh-01c', 'ec-closed-001', 'DISPATCHED',            'EN_ROUTE_TO_PATIENT',   '${ts(new Date(daysAgo(152).getTime() + 4 * 60000))}',  'u-ambulance-007', 'Driver confirmed en route'),
        ('csh-01d', 'ec-closed-001', 'EN_ROUTE_TO_PATIENT',   'AT_PATIENT',            '${ts(new Date(daysAgo(152).getTime() + 10 * 60000))}', 'u-ambulance-007', 'Reached patient location'),
        ('csh-01e', 'ec-closed-001', 'AT_PATIENT',            'EN_ROUTE_TO_HOSPITAL',  '${ts(new Date(daysAgo(152).getTime() + 12 * 60000))}', 'u-ambulance-007', 'Patient loaded, heading to KEM'),
        ('csh-01f', 'ec-closed-001', 'EN_ROUTE_TO_HOSPITAL',  'ARRIVED',               '${ts(new Date(daysAgo(152).getTime() + 15 * 60000))}', 'u-staff-apollo-003', 'Arrived at hospital'),
        ('csh-01g', 'ec-closed-001', 'ARRIVED',               'CLOSED',                '${ts(new Date(daysAgo(152).getTime() + 180 * 60000))}','u-dr-kapoor-005', 'Patient stabilised and admitted'),

        -- Case 2 lifecycle (ec-closed-002)
        ('csh-02a', 'ec-closed-002', 'TRIGGERED',             'DISPATCHED',            '${ts(new Date(daysAgo(114).getTime() + 4 * 60000))}',  'system',          'Fast-tracked dispatch'),
        ('csh-02b', 'ec-closed-002', 'DISPATCHED',            'ARRIVED',               '${ts(new Date(daysAgo(114).getTime() + 18 * 60000))}', 'u-ambulance-008', 'Arrived at Hiranandani'),
        ('csh-02c', 'ec-closed-002', 'ARRIVED',               'CLOSED',                '${ts(new Date(daysAgo(114).getTime() + 240 * 60000))}','u-dr-mehta-006',  'Fracture treated, discharged'),

        -- Case 3 (ec-dispatched-003) — still active
        ('csh-03a', 'ec-dispatched-003', 'TRIGGERED',         'DISPATCHED',            '${ts(minutesAgo(22))}', 'system', 'Ambulance amb-001 dispatched to Bandra West');
    `);
    console.log('  ✓ 11 case status history entries');

    // ── Medical Record Entries ───────────────────────────────────────────────
    await client.query(`
      INSERT INTO medical_record_entries (
        id, patient_id, document_type, extracted_data, extraction_confidence,
        low_confidence_fields, status, reviewed_by_doctor_id, reviewed_at, created_at
      ) VALUES
        (
          'mr-mihir-rx-001', 'u-mihir-001', 'prescription',
          '{"medications":["Salbutamol Inhaler 100mcg","Montelukast 10mg"],"diagnosis":"Mild persistent asthma","prescribedBy":"Dr. Arun Kapoor"}'::JSONB,
          0.95,
          ARRAY[]::TEXT[],
          'VERIFIED', 'u-dr-kapoor-005', '${ts(daysAgo(150))}', '${ts(daysAgo(152))}'
        ),
        (
          'mr-mihir-lab-002', 'u-mihir-001', 'lab_report',
          '{"testName":"Pulmonary Function Test","results":{"FEV1":"78% predicted","FVC":"85% predicted"}}'::JSONB,
          0.87,
          ARRAY['results.FEV1_FVC_Ratio']::TEXT[],
          'AI_EXTRACTED', NULL, NULL, '${ts(daysAgo(43))}'
        ),
        (
          'mr-mihir-dc-003', 'u-mihir-001', 'discharge_summary',
          '{"hospital":"KEM Hospital","diagnosis":"Acute asthma exacerbation"}'::JSONB,
          0.92,
          ARRAY[]::TEXT[],
          'VERIFIED', 'u-dr-kapoor-005', '${ts(daysAgo(148))}', '${ts(daysAgo(150))}'
        ),
        (
          'mr-prachi-rx-004', 'u-prachi-002', 'prescription',
          '{"medications":["Levothyroxine 50mcg"],"diagnosis":"Hypothyroidism (subclinical)","prescribedBy":"Dr. Priya Mehta"}'::JSONB,
          0.94,
          ARRAY[]::TEXT[],
          'VERIFIED', 'u-dr-mehta-006', '${ts(daysAgo(120))}', '${ts(daysAgo(125))}'
        ),
        (
          'mr-prachi-lab-005', 'u-prachi-002', 'lab_report',
          '{"testName":"Thyroid Function Panel","results":{"TSH":"6.2 mIU/L (H)","FreeT4":"0.9 ng/dL"}}'::JSONB,
          0.91,
          ARRAY[]::TEXT[],
          'VERIFIED', 'u-dr-mehta-006', '${ts(daysAgo(118))}', '${ts(daysAgo(122))}'
        ),
        (
          'mr-prachi-rpt-006', 'u-prachi-002', 'general_report',
          '{"testName":"X-Ray Left Wrist","findings":"Hairline fracture of distal radius"}'::JSONB,
          0.72,
          ARRAY['findings','impression']::TEXT[],
          'AI_EXTRACTED', NULL, NULL, '${ts(daysAgo(112))}'
        );
    `);
    console.log('  ✓ 6 medical record entries');

    // ── Follow-Up Recommendations ────────────────────────────────────────────
    await client.query(`
      INSERT INTO follow_up_recommendations (
        id, case_id, patient_id, recommended_test, urgency, notes,
        recommending_doctor_id, diagnostic_centre_id, status, booked_at, completed_at
      ) VALUES
        (
          'fr-001', 'ec-closed-001', 'u-mihir-001',
          'Pulmonary Function Test', 'MEDIUM',
          'Follow-up PFT recommended after acute asthma episode',
          'u-dr-kapoor-005', 'dc-srl-001',
          'COMPLETED', '${ts(daysAgo(140))}', '${ts(daysAgo(138))}'
        ),
        (
          'fr-002', 'ec-closed-002', 'u-prachi-002',
          'Follow-up X-Ray Left Wrist', 'LOW',
          'Check fracture healing progress in 6 weeks',
          'u-dr-mehta-006', 'dc-srl-001',
          'BOOKED', '${ts(daysAgo(70))}', NULL
        ),
        (
          'fr-003', NULL, 'u-prachi-002',
          'Thyroid Function Panel', 'MEDIUM',
          'Routine thyroid recheck every 3 months',
          'u-dr-mehta-006', 'dc-thyrocare-002',
          'RECOMMENDED', NULL, NULL
        );
    `);
    console.log('  ✓ 3 follow-up recommendations');

    // ── Diagnostic Centres ───────────────────────────────────────────────────
    await client.query(`
      INSERT INTO diagnostic_centres (
        id, name, location_lat, location_lng, available_tests, avg_wait_minutes, verified
      ) VALUES
        (
          'dc-srl-001', 'SRL Diagnostics Andheri',
          19.1136, 72.8697,
          ARRAY['blood_tests','imaging','pathology','PFT','ECG','allergy_testing']::TEXT[],
          25, true
        ),
        (
          'dc-thyrocare-002', 'Thyrocare Central Lab Mumbai',
          19.1862, 72.9636,
          ARRAY['blood_tests','thyroid_panel','lipid_profile','diabetes_screening','vitamin_panel','hormonal_assays']::TEXT[],
          15, true
        );
    `);
    console.log('  ✓ 2 diagnostic centres');

    // ── Notifications ────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO notifications (id, case_id, recipient, channel, content, sent_at, delivered_at) VALUES
        (
          'notif-001', 'ec-closed-001', '+919812345678', 'SMS',
          'Emergency alert: Mihir has been in a cardiac emergency. Ambulance dispatched. Track: https://health.app/track/ft-mihir-case1-20240322',
          '${ts(new Date(daysAgo(152).getTime() + 3 * 60000))}',
          '${ts(new Date(daysAgo(152).getTime() + 3.1 * 60000))}'
        ),
        (
          'notif-002', 'ec-closed-001', '+919812345678', 'WHATSAPP',
          'Update: Mihir has arrived at KEM Hospital. Status: Stable.',
          '${ts(new Date(daysAgo(152).getTime() + 15 * 60000))}',
          '${ts(new Date(daysAgo(152).getTime() + 15.2 * 60000))}'
        ),
        (
          'notif-003', 'ec-dispatched-003', '+919812345678', 'SMS',
          'Emergency alert: Mihir cardiac emergency near Carter Road. Ambulance dispatched to Lilavati Hospital. ETA 8 min.',
          '${ts(minutesAgo(22))}',
          '${ts(minutesAgo(21.5))}'
        ),
        (
          'notif-004', 'ec-triggered-004', '+919898765432', 'SMS',
          'Emergency triggered for Prachi. Awaiting triage completion. We will keep you updated.',
          '${ts(minutesAgo(5))}',
          NULL
        );
    `);
    console.log('  ✓ 4 notifications');

    // ── Audit Logs ───────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO audit_logs (id, actor_user_id, actor_role, action, entity_type, entity_id, metadata, timestamp) VALUES
        (
          'al-001', 'u-mihir-001', 'PATIENT', 'EMERGENCY_TRIGGERED', 'emergency_case', 'ec-closed-001',
          '{"source":"mobile_app","location":"Andheri"}'::JSONB,
          '${ts(daysAgo(152))}'
        ),
        (
          'al-002', 'u-dr-kapoor-005', 'DOCTOR', 'RECORD_VERIFIED', 'medical_record', 'mr-mihir-rx-001',
          '{"action":"approved","confidence_override":null}'::JSONB,
          '${ts(daysAgo(150))}'
        ),
        (
          'al-003', 'u-prachi-002', 'PATIENT', 'EMERGENCY_TRIGGERED', 'emergency_case', 'ec-closed-002',
          '{"source":"mobile_app","location":"Powai"}'::JSONB,
          '${ts(daysAgo(114))}'
        ),
        (
          'al-004', 'u-dr-mehta-006', 'DOCTOR', 'RECORD_VERIFIED', 'medical_record', 'mr-prachi-rx-004',
          '{"action":"approved"}'::JSONB,
          '${ts(daysAgo(120))}'
        ),
        (
          'al-005', 'u-mihir-001', 'PATIENT', 'EMERGENCY_TRIGGERED', 'emergency_case', 'ec-dispatched-003',
          '{"source":"mobile_app","location":"Bandra West"}'::JSONB,
          '${ts(minutesAgo(25))}'
        ),
        (
          'al-006', 'u-prachi-002', 'PATIENT', 'EMERGENCY_TRIGGERED', 'emergency_case', 'ec-triggered-004',
          '{"source":"mobile_app","location":"Andheri West"}'::JSONB,
          '${ts(minutesAgo(5))}'
        );
    `);
    console.log('  ✓ 6 audit logs');

    // ── QR Scan Logs ─────────────────────────────────────────────────────────
    await client.query(`
      INSERT INTO qr_scan_logs (id, patient_id, scanned_at, resolved_fields) VALUES
        (
          'qr-001', 'u-mihir-001',
          '${ts(daysAgo(152))}',
          ARRAY['blood_group','allergies','chronic_conditions','emergency_contact_name','emergency_contact_phone']::TEXT[]
        ),
        (
          'qr-002', 'u-prachi-002',
          '${ts(daysAgo(114))}',
          ARRAY['blood_group','allergies','chronic_conditions','emergency_contact_name','emergency_contact_phone']::TEXT[]
        ),
        (
          'qr-003', 'u-mihir-001',
          '${ts(minutesAgo(24))}',
          ARRAY['blood_group','allergies','chronic_conditions','current_medications','insurance_provider']::TEXT[]
        );
    `);
    console.log('  ✓ 3 QR scan logs');

    // ═══════════════════════════════════════════════════════════════════════════
    // COMMIT
    // ═══════════════════════════════════════════════════════════════════════════
    await client.query('COMMIT');
    console.log('\n========================================');
    console.log('  DATABASE SETUP COMPLETE');
    console.log('========================================\n');

    // ── Print summary ────────────────────────────────────────────────────────
    const counts = await client.query(`
      SELECT
        (SELECT count(*) FROM users)                   AS users,
        (SELECT count(*) FROM emergency_profiles)      AS profiles,
        (SELECT count(*) FROM hospitals)               AS hospitals,
        (SELECT count(*) FROM hospital_specialists)    AS specialists,
        (SELECT count(*) FROM ambulances)              AS ambulances,
        (SELECT count(*) FROM emergency_cases)         AS cases,
        (SELECT count(*) FROM case_status_history)     AS status_history,
        (SELECT count(*) FROM medical_record_entries)  AS medical_records,
        (SELECT count(*) FROM follow_up_recommendations) AS follow_ups,
        (SELECT count(*) FROM diagnostic_centres)      AS diagnostic_centres,
        (SELECT count(*) FROM notifications)           AS notifications,
        (SELECT count(*) FROM audit_logs)              AS audit_logs,
        (SELECT count(*) FROM qr_scan_logs)            AS qr_scans
    `);
    const c = counts.rows[0];
    console.log('Record counts:');
    console.log(`  Users:                ${c.users}`);
    console.log(`  Emergency Profiles:   ${c.profiles}`);
    console.log(`  Hospitals:            ${c.hospitals}`);
    console.log(`  Hospital Specialists: ${c.specialists}`);
    console.log(`  Ambulances:           ${c.ambulances}`);
    console.log(`  Emergency Cases:      ${c.cases}`);
    console.log(`  Status History:       ${c.status_history}`);
    console.log(`  Medical Records:      ${c.medical_records}`);
    console.log(`  Follow-ups:           ${c.follow_ups}`);
    console.log(`  Diagnostic Centres:   ${c.diagnostic_centres}`);
    console.log(`  Notifications:        ${c.notifications}`);
    console.log(`  Audit Logs:           ${c.audit_logs}`);
    console.log(`  QR Scan Logs:         ${c.qr_scans}`);

    console.log('\n--- Login Credentials ---');
    console.log('Patient (Mihir):     mihircodes20@gmail.com  / +919876543210');
    console.log('Patient (Prachi):    prachi.7haa@gmail.com   / +919876543211');
    console.log('Hospital Staff:      prateekraushan00@gmail.com / +919800000001');
    console.log('Hospital Staff:      staff.fortis@health.com / +919800000002');
    console.log('Doctor (Kapoor):     124cs0082@iiitk.ac.in    / +919800000003');
    console.log('Doctor (Mehta):      dr.mehta@health.com     / +919800000004');
    console.log('Ambulance (Vikram):  amb.vikram@health.com   / +919800000005');
    console.log('Ambulance (Suresh):  amb.suresh@health.com   / +919800000006');
    console.log('Admin:               admin@health.com        / +919800000007');
    console.log('');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n✗ SETUP FAILED — transaction rolled back');
    console.error(err);
    process.exit(1);
  } finally {
    await client.end();
    console.log('✓ Connection closed');
  }
}

main();
