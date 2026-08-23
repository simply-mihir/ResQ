const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const hoursAgo = (n) => new Date(Date.now() - n * 3600000);
const minutesAgo = (n) => new Date(Date.now() - n * 60000);

// ---------------------------------------------------------------------------
// Deterministic IDs
// ---------------------------------------------------------------------------
const IDS = {
  USER_MIHIR: 'u-mihir-001',
  USER_PRACHI: 'u-prachi-002',
  USER_STAFF_APOLLO: 'u-staff-apollo-003',
  USER_STAFF_FORTIS: 'u-staff-fortis-004',
  USER_DR_KAPOOR: 'u-dr-kapoor-005',
  USER_DR_MEHTA: 'u-dr-mehta-006',
  USER_AMBULANCE_1: 'u-ambulance-007',
  USER_AMBULANCE_2: 'u-ambulance-008',
  USER_ADMIN: 'u-admin-009',

  EP_MIHIR: 'ep-mihir-001',
  EP_PRACHI: 'ep-prachi-002',

  H_APOLLO: 'h-apollo-001',
  H_FORTIS: 'h-fortis-002',
  H_NANAVATI: 'h-nanavati-003',
  H_LILAVATI: 'h-lilavati-004',
  H_KEM: 'h-kem-005',
  H_HINDUJA: 'h-hinduja-006',
  H_BREACH_CANDY: 'h-breach-candy-007',
  H_JASLOK: 'h-jaslok-008',
  H_BOMBAY: 'h-bombay-009',
  H_KOKILABEN: 'h-kokilaben-010',
  H_WOCKHARDT: 'h-wockhardt-011',
  H_SEVEN_HILLS: 'h-seven-hills-012',
  H_GLOBAL: 'h-global-013',
  H_RELIANCE: 'h-reliance-014',
  H_TATA: 'h-tata-015',
  H_HIRANANDANI: 'h-hiranandani-016',
  H_JUPITER: 'h-jupiter-017',
  H_ASIAN_HEART: 'h-asian-heart-018',
  H_SAIFEE: 'h-saifee-019',
  H_HOLY_SPIRIT: 'h-holy-spirit-020',

  AMB_1: 'amb-001', AMB_2: 'amb-002', AMB_3: 'amb-003', AMB_4: 'amb-004',
  AMB_5: 'amb-005', AMB_6: 'amb-006', AMB_7: 'amb-007', AMB_8: 'amb-008',
  AMB_9: 'amb-009', AMB_10: 'amb-010',

  MR_MIHIR_RX: 'mr-mihir-rx-001',
  MR_MIHIR_LAB: 'mr-mihir-lab-002',
  MR_MIHIR_DC: 'mr-mihir-dc-003',
  MR_PRACHI_RX: 'mr-prachi-rx-004',
  MR_PRACHI_LAB: 'mr-prachi-lab-005',
  MR_PRACHI_RPT: 'mr-prachi-rpt-006',

  CASE_CLOSED_1: 'ec-closed-001',
  CASE_CLOSED_2: 'ec-closed-002',
  CASE_DISPATCHED: 'ec-dispatched-003',
  CASE_TRIGGERED: 'ec-triggered-004',

  DC_1: 'dc-srl-001',
  DC_2: 'dc-thyrocare-002',
};

// ============================================================================
// 1. USERS (9 total)
// ============================================================================
const users = [
  {
    id: IDS.USER_MIHIR,
    name: 'Mihir',
    email: 'mihircodes20@gmail.com',
    phone: '+919876543210',
    role: 'PATIENT',
    verified: true,
  },
  {
    id: IDS.USER_PRACHI,
    name: 'Prachi',
    email: 'prachi.7haa@gmail.com',
    phone: '+919876543211',
    role: 'PATIENT',
    verified: true,
  },
  {
    id: IDS.USER_STAFF_APOLLO,
    name: 'Ramesh Nair',
    email: 'prateekraushan00@gmail.com',
    phone: '+919800000001',
    role: 'HOSPITAL_STAFF',
    verified: true,
    orgId: 'h-apollo-001',
  },
  {
    id: IDS.USER_STAFF_FORTIS,
    name: 'Sunita Desai',
    email: 'staff.fortis@health.com',
    phone: '+919800000002',
    role: 'HOSPITAL_STAFF',
    verified: true,
    orgId: 'h-fortis-002',
  },
  {
    id: IDS.USER_DR_KAPOOR,
    name: 'Dr. Arun Kapoor',
    email: '124cs0082@iiitk.ac.in',
    phone: '+919800000003',
    role: 'DOCTOR',
    verified: true,
    orgId: 'h-apollo-001',
  },
  {
    id: IDS.USER_DR_MEHTA,
    name: 'Dr. Priya Mehta',
    email: 'dr.mehta@health.com',
    phone: '+919800000004',
    role: 'DOCTOR',
    verified: true,
    orgId: 'h-nanavati-003',
  },
  {
    id: IDS.USER_AMBULANCE_1,
    name: 'Vikram Patil',
    email: 'amb.vikram@health.com',
    phone: '+919800000005',
    role: 'AMBULANCE',
    verified: true,
  },
  {
    id: IDS.USER_AMBULANCE_2,
    name: 'Suresh Yadav',
    email: 'amb.suresh@health.com',
    phone: '+919800000006',
    role: 'AMBULANCE',
    verified: true,
  },
  {
    id: IDS.USER_ADMIN,
    name: 'Admin',
    email: 'admin@health.com',
    phone: '+919800000007',
    role: 'ADMIN',
    verified: true,
  },
];

// ============================================================================
// 2. EMERGENCY PROFILES (2)
// ============================================================================
const emergencyProfiles = [
  {
    id: IDS.EP_MIHIR,
    userId: IDS.USER_MIHIR,
    bloodGroup: 'O+',
    allergies: ['Penicillin', 'Dust'],
    chronicConditions: ['Mild Asthma'],
    currentMedications: ['Salbutamol Inhaler'],
    emergencyContactName: 'Ravi Sharma',
    emergencyContactPhone: '+919812345678',
    insuranceProvider: 'Star Health',
    insurancePolicyNumber: 'SH-MUM-2024-88421',
    qrToken: 'mihir-health-qr-2024',
    consentGivenAt: daysAgo(200),
    consentVersion: '1.0',
  },
  {
    id: IDS.EP_PRACHI,
    userId: IDS.USER_PRACHI,
    bloodGroup: 'B+',
    allergies: ['Sulfa Drugs'],
    chronicConditions: ['Hypothyroidism'],
    currentMedications: ['Levothyroxine 50mcg'],
    emergencyContactName: 'Sneha Thakur',
    emergencyContactPhone: '+919898765432',
    insuranceProvider: 'HDFC Ergo',
    insurancePolicyNumber: 'HE-MUM-2024-76553',
    qrToken: 'prachi-health-qr-2024',
    consentGivenAt: daysAgo(180),
    consentVersion: '1.0',
  },
];

// ============================================================================
// 3. HOSPITALS (20)
// ============================================================================
const hospitals = [
  { id: IDS.H_APOLLO, name: 'Apollo Hospital Mumbai', locationLat: 19.0596, locationLng: 72.8295, address: 'Plot 13, Parsik Hill Road, off Uran Road, CBD Belapur, Navi Mumbai', phone: '+912227723333', specialties: ['cardiology','neurology','orthopedics','general','trauma_surgery','oncology'], traumaCapable: true, bedCapacityTotal: 250, bedCapacityFree: 34, verifiedPartner: true, rating: 4.7 },
  { id: IDS.H_FORTIS, name: 'Fortis Hospital Mulund', locationLat: 19.1726, locationLng: 72.9569, address: 'Mulund Goregaon Link Road, Mulund West, Mumbai 400078', phone: '+912225997000', specialties: ['cardiology','orthopedics','general','pediatrics','gastroenterology'], traumaCapable: true, bedCapacityTotal: 200, bedCapacityFree: 28, verifiedPartner: true, rating: 4.5 },
  { id: IDS.H_NANAVATI, name: 'Nanavati Super Speciality Hospital', locationLat: 19.0984, locationLng: 72.8367, address: 'S.V. Road, Vile Parle West, Mumbai 400056', phone: '+912226267500', specialties: ['cardiology','neurology','orthopedics','general','nephrology','pulmonology'], traumaCapable: true, bedCapacityTotal: 300, bedCapacityFree: 45, verifiedPartner: true, rating: 4.6 },
  { id: IDS.H_LILAVATI, name: 'Lilavati Hospital', locationLat: 19.0509, locationLng: 72.8294, address: 'A-791, Bandra Reclamation, Bandra West, Mumbai 400050', phone: '+912226568000', specialties: ['cardiology','neurology','orthopedics','general','trauma_surgery','urology'], traumaCapable: true, bedCapacityTotal: 200, bedCapacityFree: 18, verifiedPartner: true, rating: 4.8 },
  { id: IDS.H_KEM, name: 'KEM Hospital', locationLat: 19.0007, locationLng: 72.8422, address: 'Acharya Donde Marg, Parel, Mumbai 400012', phone: '+912224136051', specialties: ['general','trauma_surgery','emergency_medicine','orthopedics','neurology','pulmonology'], traumaCapable: true, bedCapacityTotal: 280, bedCapacityFree: 12, verifiedPartner: true, rating: 4.2 },
  { id: IDS.H_HINDUJA, name: 'Hinduja Hospital', locationLat: 19.0380, locationLng: 72.8430, address: 'Veer Savarkar Marg, Mahim, Mumbai 400016', phone: '+912224451515', specialties: ['cardiology','neurology','gastroenterology','nephrology','general'], traumaCapable: true, bedCapacityTotal: 180, bedCapacityFree: 22, verifiedPartner: true, rating: 4.6 },
  { id: IDS.H_BREACH_CANDY, name: 'Breach Candy Hospital', locationLat: 18.9716, locationLng: 72.8052, address: '60A, Bhulabhai Desai Road, Mumbai 400026', phone: '+912223667788', specialties: ['cardiology','general','orthopedics','ENT','dermatology'], traumaCapable: false, bedCapacityTotal: 150, bedCapacityFree: 15, verifiedPartner: true, rating: 4.5 },
  { id: IDS.H_JASLOK, name: 'Jaslok Hospital', locationLat: 18.9706, locationLng: 72.8073, address: '15, Dr G Deshmukh Marg, Pedder Road, Mumbai 400026', phone: '+912226567788', specialties: ['cardiology','neurology','orthopedics','general','oncology'], traumaCapable: false, bedCapacityTotal: 170, bedCapacityFree: 20, verifiedPartner: true, rating: 4.4 },
  { id: IDS.H_BOMBAY, name: 'Bombay Hospital', locationLat: 18.9485, locationLng: 72.8277, address: '12, New Marine Lines, Mumbai 400020', phone: '+912222067676', specialties: ['cardiology','neurology','orthopedics','general','trauma_surgery','emergency_medicine','pulmonology'], traumaCapable: true, bedCapacityTotal: 260, bedCapacityFree: 30, verifiedPartner: true, rating: 4.3 },
  { id: IDS.H_KOKILABEN, name: 'Kokilaben Dhirubhai Ambani Hospital', locationLat: 19.1310, locationLng: 72.8269, address: 'Rao Saheb Achutrao Patwardhan Marg, Four Bungalows, Andheri West', phone: '+912230999999', specialties: ['cardiology','neurology','orthopedics','general','trauma_surgery','oncology','nephrology','urology'], traumaCapable: true, bedCapacityTotal: 300, bedCapacityFree: 40, verifiedPartner: true, rating: 4.9 },
  { id: IDS.H_WOCKHARDT, name: 'Wockhardt Hospital', locationLat: 19.0170, locationLng: 72.8561, address: '1877, Dr Anandrao Nair Marg, Mumbai Central, Mumbai 400011', phone: '+912261784444', specialties: ['cardiology','orthopedics','general','gastroenterology'], traumaCapable: false, bedCapacityTotal: 120, bedCapacityFree: 10, verifiedPartner: true, rating: 4.1 },
  { id: IDS.H_SEVEN_HILLS, name: 'Seven Hills Hospital', locationLat: 19.1077, locationLng: 72.8674, address: 'Marol Maroshi Road, Andheri East, Mumbai 400059', phone: '+912267676767', specialties: ['cardiology','orthopedics','general','emergency_medicine','pulmonology'], traumaCapable: true, bedCapacityTotal: 180, bedCapacityFree: 25, verifiedPartner: true, rating: 4.0 },
  { id: IDS.H_GLOBAL, name: 'Global Hospital', locationLat: 19.0990, locationLng: 72.8868, address: '35, Dr E Borges Road, Hospital Avenue, Parel, Mumbai 400012', phone: '+912222488000', specialties: ['nephrology','urology','general','gastroenterology'], traumaCapable: false, bedCapacityTotal: 100, bedCapacityFree: 8, verifiedPartner: true, rating: 4.2 },
  { id: IDS.H_RELIANCE, name: 'Sir HN Reliance Foundation Hospital', locationLat: 18.9870, locationLng: 72.8331, address: 'Raja Rammohan Roy Road, Prarthana Samaj, Girgaon, Mumbai 400004', phone: '+912261303030', specialties: ['cardiology','neurology','orthopedics','general','trauma_surgery','oncology','emergency_medicine'], traumaCapable: true, bedCapacityTotal: 220, bedCapacityFree: 32, verifiedPartner: true, rating: 4.7 },
  { id: IDS.H_TATA, name: 'Tata Memorial Hospital', locationLat: 19.0037, locationLng: 72.8426, address: 'Dr Ernest Borges Marg, Parel, Mumbai 400012', phone: '+912224177000', specialties: ['oncology','general','pulmonology'], traumaCapable: false, bedCapacityTotal: 200, bedCapacityFree: 5, verifiedPartner: true, rating: 4.8 },
  { id: IDS.H_HIRANANDANI, name: 'Hiranandani Hospital Powai', locationLat: 19.1197, locationLng: 72.9074, address: 'Hillside Avenue, Hiranandani Gardens, Powai, Mumbai 400076', phone: '+912225763300', specialties: ['orthopedics','general','pediatrics','ENT','dermatology','emergency_medicine'], traumaCapable: true, bedCapacityTotal: 160, bedCapacityFree: 20, verifiedPartner: true, rating: 4.4 },
  { id: IDS.H_JUPITER, name: 'Jupiter Hospital Thane', locationLat: 19.2094, locationLng: 72.9737, address: 'Eastern Express Highway, Thane West, Thane 400601', phone: '+912225392200', specialties: ['cardiology','neurology','orthopedics','general','trauma_surgery','gastroenterology'], traumaCapable: true, bedCapacityTotal: 220, bedCapacityFree: 35, verifiedPartner: true, rating: 4.5 },
  { id: IDS.H_ASIAN_HEART, name: 'Asian Heart Institute', locationLat: 19.0487, locationLng: 72.8290, address: 'G/N Block, BKC, Bandra Kurla Complex, Mumbai 400051', phone: '+912266981500', specialties: ['cardiology','general'], traumaCapable: false, bedCapacityTotal: 80, bedCapacityFree: 12, verifiedPartner: true, rating: 4.9 },
  { id: IDS.H_SAIFEE, name: 'Saifee Hospital', locationLat: 18.9616, locationLng: 72.8128, address: '15/17, Maharshi Karve Marg, Charni Road, Mumbai 400004', phone: '+912267570111', specialties: ['orthopedics','general','psychiatry','ENT','urology'], traumaCapable: false, bedCapacityTotal: 140, bedCapacityFree: 16, verifiedPartner: true, rating: 4.3 },
  { id: IDS.H_HOLY_SPIRIT, name: 'Holy Spirit Hospital', locationLat: 19.1061, locationLng: 72.8369, address: 'Mahakali Caves Road, Andheri East, Mumbai 400093', phone: '+912228242131', specialties: ['general','pediatrics','orthopedics','dermatology'], traumaCapable: false, bedCapacityTotal: 120, bedCapacityFree: 14, verifiedPartner: true, rating: 3.9 },
];

// ============================================================================
// 4. HOSPITAL SPECIALISTS (50)
// ============================================================================
const hospitalSpecialists = [
  // Apollo (4)
  { id: 'hs-001', hospitalId: IDS.H_APOLLO, specialty: 'cardiology', available: true },
  { id: 'hs-002', hospitalId: IDS.H_APOLLO, specialty: 'neurology', available: true },
  { id: 'hs-003', hospitalId: IDS.H_APOLLO, specialty: 'trauma_surgery', available: true },
  { id: 'hs-004', hospitalId: IDS.H_APOLLO, specialty: 'general', available: true },
  // Fortis (3)
  { id: 'hs-005', hospitalId: IDS.H_FORTIS, specialty: 'cardiology', available: true },
  { id: 'hs-006', hospitalId: IDS.H_FORTIS, specialty: 'orthopedics', available: true },
  { id: 'hs-007', hospitalId: IDS.H_FORTIS, specialty: 'general', available: true },
  // Nanavati (3)
  { id: 'hs-008', hospitalId: IDS.H_NANAVATI, specialty: 'neurology', available: true },
  { id: 'hs-009', hospitalId: IDS.H_NANAVATI, specialty: 'nephrology', available: true },
  { id: 'hs-010', hospitalId: IDS.H_NANAVATI, specialty: 'pulmonology', available: false },
  // Lilavati (3)
  { id: 'hs-011', hospitalId: IDS.H_LILAVATI, specialty: 'cardiology', available: true },
  { id: 'hs-012', hospitalId: IDS.H_LILAVATI, specialty: 'trauma_surgery', available: true },
  { id: 'hs-013', hospitalId: IDS.H_LILAVATI, specialty: 'urology', available: true },
  // KEM (3)
  { id: 'hs-014', hospitalId: IDS.H_KEM, specialty: 'trauma_surgery', available: true },
  { id: 'hs-015', hospitalId: IDS.H_KEM, specialty: 'emergency_medicine', available: true },
  { id: 'hs-016', hospitalId: IDS.H_KEM, specialty: 'general', available: true },
  // Hinduja (2)
  { id: 'hs-017', hospitalId: IDS.H_HINDUJA, specialty: 'gastroenterology', available: true },
  { id: 'hs-018', hospitalId: IDS.H_HINDUJA, specialty: 'nephrology', available: true },
  // Breach Candy (2)
  { id: 'hs-019', hospitalId: IDS.H_BREACH_CANDY, specialty: 'cardiology', available: false },
  { id: 'hs-020', hospitalId: IDS.H_BREACH_CANDY, specialty: 'ENT', available: true },
  // Jaslok (2)
  { id: 'hs-021', hospitalId: IDS.H_JASLOK, specialty: 'neurology', available: true },
  { id: 'hs-022', hospitalId: IDS.H_JASLOK, specialty: 'oncology', available: true },
  // Bombay (3)
  { id: 'hs-023', hospitalId: IDS.H_BOMBAY, specialty: 'trauma_surgery', available: true },
  { id: 'hs-024', hospitalId: IDS.H_BOMBAY, specialty: 'emergency_medicine', available: true },
  { id: 'hs-025', hospitalId: IDS.H_BOMBAY, specialty: 'pulmonology', available: true },
  // Kokilaben (4)
  { id: 'hs-026', hospitalId: IDS.H_KOKILABEN, specialty: 'cardiology', available: true },
  { id: 'hs-027', hospitalId: IDS.H_KOKILABEN, specialty: 'neurology', available: true },
  { id: 'hs-028', hospitalId: IDS.H_KOKILABEN, specialty: 'trauma_surgery', available: true },
  { id: 'hs-029', hospitalId: IDS.H_KOKILABEN, specialty: 'oncology', available: false },
  // Wockhardt (2)
  { id: 'hs-030', hospitalId: IDS.H_WOCKHARDT, specialty: 'cardiology', available: true },
  { id: 'hs-031', hospitalId: IDS.H_WOCKHARDT, specialty: 'gastroenterology', available: true },
  // Seven Hills (2)
  { id: 'hs-032', hospitalId: IDS.H_SEVEN_HILLS, specialty: 'emergency_medicine', available: true },
  { id: 'hs-033', hospitalId: IDS.H_SEVEN_HILLS, specialty: 'pulmonology', available: false },
  // Global (2)
  { id: 'hs-034', hospitalId: IDS.H_GLOBAL, specialty: 'nephrology', available: true },
  { id: 'hs-035', hospitalId: IDS.H_GLOBAL, specialty: 'urology', available: true },
  // Reliance (3)
  { id: 'hs-036', hospitalId: IDS.H_RELIANCE, specialty: 'cardiology', available: true },
  { id: 'hs-037', hospitalId: IDS.H_RELIANCE, specialty: 'trauma_surgery', available: true },
  { id: 'hs-038', hospitalId: IDS.H_RELIANCE, specialty: 'emergency_medicine', available: true },
  // Tata (2)
  { id: 'hs-039', hospitalId: IDS.H_TATA, specialty: 'oncology', available: true },
  { id: 'hs-040', hospitalId: IDS.H_TATA, specialty: 'pulmonology', available: true },
  // Hiranandani (3)
  { id: 'hs-041', hospitalId: IDS.H_HIRANANDANI, specialty: 'orthopedics', available: true },
  { id: 'hs-042', hospitalId: IDS.H_HIRANANDANI, specialty: 'pediatrics', available: true },
  { id: 'hs-043', hospitalId: IDS.H_HIRANANDANI, specialty: 'emergency_medicine', available: true },
  // Jupiter (3)
  { id: 'hs-044', hospitalId: IDS.H_JUPITER, specialty: 'neurology', available: true },
  { id: 'hs-045', hospitalId: IDS.H_JUPITER, specialty: 'trauma_surgery', available: true },
  { id: 'hs-046', hospitalId: IDS.H_JUPITER, specialty: 'gastroenterology', available: false },
  // Asian Heart (2)
  { id: 'hs-047', hospitalId: IDS.H_ASIAN_HEART, specialty: 'cardiology', available: true },
  { id: 'hs-048', hospitalId: IDS.H_ASIAN_HEART, specialty: 'general', available: true },
  // Saifee (2)
  { id: 'hs-049', hospitalId: IDS.H_SAIFEE, specialty: 'psychiatry', available: true },
  { id: 'hs-050', hospitalId: IDS.H_SAIFEE, specialty: 'orthopedics', available: false },
];

// ============================================================================
// 5. AMBULANCES (10)
// ============================================================================
const ambulances = [
  { id: IDS.AMB_1, vehicleNumber: 'MH-01-AB-1234', status: 'DISPATCHED', currentLat: 19.055, currentLng: 72.831, locationUpdatedAt: minutesAgo(2) },
  { id: IDS.AMB_2, vehicleNumber: 'MH-01-CD-5678', status: 'AVAILABLE', currentLat: 19.098, currentLng: 72.836, locationUpdatedAt: minutesAgo(5) },
  { id: IDS.AMB_3, vehicleNumber: 'MH-01-EF-9012', status: 'AVAILABLE', currentLat: 19.118, currentLng: 72.907, locationUpdatedAt: minutesAgo(8) },
  { id: IDS.AMB_4, vehicleNumber: 'MH-01-GH-3456', status: 'AVAILABLE', currentLat: 18.998, currentLng: 72.840, locationUpdatedAt: minutesAgo(3) },
  { id: IDS.AMB_5, vehicleNumber: 'MH-01-IJ-7890', status: 'AVAILABLE', currentLat: 19.131, currentLng: 72.828, locationUpdatedAt: minutesAgo(10) },
  { id: IDS.AMB_6, vehicleNumber: 'MH-01-KL-2345', status: 'AVAILABLE', currentLat: 19.040, currentLng: 72.843, locationUpdatedAt: minutesAgo(4) },
  { id: IDS.AMB_7, vehicleNumber: 'MH-01-MN-6789', status: 'AVAILABLE', currentLat: 19.172, currentLng: 72.958, locationUpdatedAt: minutesAgo(15) },
  { id: IDS.AMB_8, vehicleNumber: 'MH-01-OP-0123', status: 'OFFLINE', currentLat: null, currentLng: null, locationUpdatedAt: null },
  { id: IDS.AMB_9, vehicleNumber: 'MH-01-QR-4567', status: 'AVAILABLE', currentLat: 19.209, currentLng: 72.975, locationUpdatedAt: minutesAgo(7) },
  { id: IDS.AMB_10, vehicleNumber: 'MH-01-ST-8901', status: 'AVAILABLE', currentLat: 18.962, currentLng: 72.812, locationUpdatedAt: minutesAgo(12) },
];

// ============================================================================
// 6. MEDICAL RECORDS (6)
// ============================================================================
const medicalRecordEntries = [
  {
    id: IDS.MR_MIHIR_RX,
    patientId: IDS.USER_MIHIR,
    sourceDocumentUrl: 'uploads/mihir/prescription-asthma-2024.jpg',
    documentType: 'prescription',
    extractedData: { medications: ['Salbutamol Inhaler 100mcg - 2 puffs as needed', 'Montelukast 10mg - once daily at bedtime'], diagnosis: 'Mild persistent asthma', prescribedBy: 'Dr. Arun Kapoor', date: '2024-03-22', notes: 'Carry rescue inhaler at all times' },
    extractionConfidence: 0.95,
    lowConfidenceFields: [],
    status: 'VERIFIED',
    reviewedByDoctorId: IDS.USER_DR_KAPOOR,
    reviewedAt: daysAgo(150),
    createdAt: daysAgo(152),
  },
  {
    id: IDS.MR_MIHIR_LAB,
    patientId: IDS.USER_MIHIR,
    sourceDocumentUrl: 'uploads/mihir/lab-report-pft-2024.jpg',
    documentType: 'lab_report',
    extractedData: { testName: 'Pulmonary Function Test', results: { FEV1: '78% predicted', FVC: '85% predicted', FEV1_FVC_Ratio: '0.72' }, interpretation: 'Mild obstructive pattern consistent with asthma', lab: 'SRL Diagnostics Andheri' },
    extractionConfidence: 0.87,
    lowConfidenceFields: ['results.FEV1_FVC_Ratio'],
    status: 'AI_EXTRACTED',
    createdAt: daysAgo(43),
  },
  {
    id: IDS.MR_MIHIR_DC,
    patientId: IDS.USER_MIHIR,
    sourceDocumentUrl: 'uploads/mihir/discharge-kem-2024.jpg',
    documentType: 'discharge_summary',
    extractedData: { hospital: 'KEM Hospital', admittedDate: '2024-03-22', dischargedDate: '2024-03-24', diagnosis: 'Acute asthma exacerbation', treatment: 'IV Hydrocortisone, Nebulized Salbutamol, Oxygen therapy', dischargeMedications: ['Montelukast 10mg OD', 'Salbutamol Inhaler PRN', 'Prednisolone 20mg tapering over 5 days'], followUp: 'Pulmonology OPD in 1 week' },
    extractionConfidence: 0.92,
    lowConfidenceFields: [],
    status: 'VERIFIED',
    reviewedByDoctorId: IDS.USER_DR_KAPOOR,
    reviewedAt: daysAgo(148),
    createdAt: daysAgo(150),
  },
  {
    id: IDS.MR_PRACHI_RX,
    patientId: IDS.USER_PRACHI,
    sourceDocumentUrl: 'uploads/prachi/prescription-thyroid-2024.jpg',
    documentType: 'prescription',
    extractedData: { medications: ['Levothyroxine 50mcg - once daily, empty stomach, 30 min before breakfast'], diagnosis: 'Hypothyroidism (subclinical)', prescribedBy: 'Dr. Priya Mehta', date: '2024-04-15', notes: 'Recheck TSH in 6 weeks' },
    extractionConfidence: 0.94,
    lowConfidenceFields: [],
    status: 'VERIFIED',
    reviewedByDoctorId: IDS.USER_DR_MEHTA,
    reviewedAt: daysAgo(120),
    createdAt: daysAgo(125),
  },
  {
    id: IDS.MR_PRACHI_LAB,
    patientId: IDS.USER_PRACHI,
    sourceDocumentUrl: 'uploads/prachi/lab-thyroid-panel-2024.jpg',
    documentType: 'lab_report',
    extractedData: { testName: 'Thyroid Function Panel', results: { TSH: '6.2 mIU/L (H)', FreeT4: '0.9 ng/dL', FreeT3: '2.4 pg/mL' }, interpretation: 'Mildly elevated TSH with normal T3/T4 suggestive of subclinical hypothyroidism', lab: 'Thyrocare Central Lab' },
    extractionConfidence: 0.91,
    lowConfidenceFields: [],
    status: 'VERIFIED',
    reviewedByDoctorId: IDS.USER_DR_MEHTA,
    reviewedAt: daysAgo(118),
    createdAt: daysAgo(122),
  },
  {
    id: IDS.MR_PRACHI_RPT,
    patientId: IDS.USER_PRACHI,
    sourceDocumentUrl: 'uploads/prachi/xray-wrist-2024.jpg',
    documentType: 'general_report',
    extractedData: { testName: 'X-Ray Left Wrist AP/Lateral', findings: 'Hairline fracture of distal radius. No displacement. Soft tissue swelling noted.', impression: 'Non-displaced distal radius fracture', reportedBy: 'Dr. R. Sharma, Radiologist' },
    extractionConfidence: 0.72,
    lowConfidenceFields: ['findings', 'impression'],
    status: 'AI_EXTRACTED',
    createdAt: daysAgo(112),
  },
];

// ============================================================================
// 7. EMERGENCY CASES (4)
// ============================================================================
const emergencyCases = [
  {
    id: IDS.CASE_CLOSED_1,
    caseNumber: 'HC-2024-10001',
    status: 'CLOSED',
    triggeredByUserId: IDS.USER_MIHIR,
    emergencyProfileId: IDS.EP_MIHIR,
    locationLat: 19.076,
    locationLng: 72.8777,
    locationAddress: 'Andheri Station Road, Andheri West, Mumbai 400058',
    triageData: { conscious: true, breathing: false, bleeding: false, situationType: 'cardiac', notes: 'Severe breathlessness and wheezing' },
    severityTier: 'HIGH',
    severityScore: 8,
    assignedHospitalId: IDS.H_KEM,
    assignedAmbulanceId: IDS.AMB_4,
    dispatchedAt: new Date(daysAgo(152).getTime() + 3 * 60000),
    hospitalAlertedAt: new Date(daysAgo(152).getTime() + 4 * 60000),
    hospitalAcknowledgedAt: new Date(daysAgo(152).getTime() + 6 * 60000),
    arrivedAt: new Date(daysAgo(152).getTime() + 15 * 60000),
    closedAt: daysAgo(150),
    etaMinutes: 12,
    familyToken: 'ft-mihir-case1-20240322',
    createdAt: daysAgo(152),
  },
  {
    id: IDS.CASE_CLOSED_2,
    caseNumber: 'HC-2024-10042',
    status: 'CLOSED',
    triggeredByUserId: IDS.USER_PRACHI,
    emergencyProfileId: IDS.EP_PRACHI,
    locationLat: 19.118,
    locationLng: 72.905,
    locationAddress: 'Powai Lake Road, near IIT Bombay, Mumbai 400076',
    triageData: { conscious: true, breathing: true, bleeding: true, situationType: 'accident', notes: 'Road traffic accident - left wrist injury' },
    severityTier: 'HIGH',
    severityScore: 8,
    assignedHospitalId: IDS.H_HIRANANDANI,
    assignedAmbulanceId: IDS.AMB_3,
    dispatchedAt: new Date(daysAgo(114).getTime() + 4 * 60000),
    hospitalAlertedAt: new Date(daysAgo(114).getTime() + 5 * 60000),
    hospitalAcknowledgedAt: new Date(daysAgo(114).getTime() + 7 * 60000),
    arrivedAt: new Date(daysAgo(114).getTime() + 18 * 60000),
    closedAt: daysAgo(113),
    etaMinutes: 10,
    familyToken: 'ft-prachi-case2-20240501',
    createdAt: daysAgo(114),
  },
  {
    id: IDS.CASE_DISPATCHED,
    caseNumber: 'HC-2024-10187',
    status: 'DISPATCHED',
    triggeredByUserId: IDS.USER_MIHIR,
    emergencyProfileId: IDS.EP_MIHIR,
    locationLat: 19.044,
    locationLng: 72.82,
    locationAddress: 'Carter Road, Bandra West, Mumbai 400050',
    triageData: { conscious: true, breathing: false, bleeding: false, situationType: 'cardiac', notes: 'Chest tightness and difficulty breathing' },
    severityTier: 'HIGH',
    severityScore: 8,
    assignedHospitalId: IDS.H_LILAVATI,
    assignedAmbulanceId: IDS.AMB_1,
    dispatchedAt: minutesAgo(20),
    hospitalAlertedAt: minutesAgo(19),
    hospitalAcknowledgedAt: minutesAgo(17),
    etaMinutes: 8,
    familyToken: 'ft-mihir-case3-active',
    createdAt: minutesAgo(25),
  },
  {
    id: IDS.CASE_TRIGGERED,
    caseNumber: 'HC-2024-10188',
    status: 'TRIGGERED',
    triggeredByUserId: IDS.USER_PRACHI,
    emergencyProfileId: IDS.EP_PRACHI,
    locationLat: 19.107,
    locationLng: 72.837,
    locationAddress: 'Andheri East, near WEH Metro Station, Mumbai 400069',
    triageData: { conscious: true, breathing: true, bleeding: false, situationType: 'unknown', notes: 'Sudden dizziness and fatigue' },
    severityTier: 'LOW',
    severityScore: 2,
    familyToken: 'ft-prachi-case4-triggered',
    createdAt: minutesAgo(5),
  },
];

// ============================================================================
// 8. CASE STATUS HISTORY (11 entries)
// ============================================================================
const caseStatusHistory = [
  // Case 1 lifecycle
  { id: 'csh-01a', caseId: IDS.CASE_CLOSED_1, fromStatus: 'TRIGGERED', toStatus: 'TRIGGERED', changedBy: 'system', notes: 'SOS triggered by patient via app', changedAt: daysAgo(152) },
  { id: 'csh-01b', caseId: IDS.CASE_CLOSED_1, fromStatus: 'TRIGGERED', toStatus: 'DISPATCHED', changedBy: 'system', notes: 'Ambulance MH-01-GH-3456 dispatched. KEM Hospital notified.', changedAt: new Date(daysAgo(152).getTime() + 3 * 60000) },
  { id: 'csh-01c', caseId: IDS.CASE_CLOSED_1, fromStatus: 'DISPATCHED', toStatus: 'EN_ROUTE_TO_HOSPITAL', changedBy: IDS.USER_AMBULANCE_1, notes: 'Patient picked up. Nebulization started en route.', changedAt: new Date(daysAgo(152).getTime() + 12 * 60000) },
  { id: 'csh-01d', caseId: IDS.CASE_CLOSED_1, fromStatus: 'EN_ROUTE_TO_HOSPITAL', toStatus: 'CLOSED', changedBy: IDS.USER_STAFF_APOLLO, notes: 'Patient admitted to KEM ER, stabilized, discharged after 48h.', changedAt: daysAgo(150) },
  // Case 2 lifecycle
  { id: 'csh-02a', caseId: IDS.CASE_CLOSED_2, fromStatus: 'TRIGGERED', toStatus: 'TRIGGERED', changedBy: 'system', notes: 'Emergency triggered via QR scan by bystander', changedAt: daysAgo(114) },
  { id: 'csh-02b', caseId: IDS.CASE_CLOSED_2, fromStatus: 'TRIGGERED', toStatus: 'DISPATCHED', changedBy: 'system', notes: 'Ambulance MH-01-EF-9012 dispatched. Hiranandani Hospital alerted.', changedAt: new Date(daysAgo(114).getTime() + 4 * 60000) },
  { id: 'csh-02c', caseId: IDS.CASE_CLOSED_2, fromStatus: 'DISPATCHED', toStatus: 'EN_ROUTE_TO_HOSPITAL', changedBy: IDS.USER_AMBULANCE_2, notes: 'Patient on stretcher. Left wrist immobilized.', changedAt: new Date(daysAgo(114).getTime() + 15 * 60000) },
  { id: 'csh-02d', caseId: IDS.CASE_CLOSED_2, fromStatus: 'EN_ROUTE_TO_HOSPITAL', toStatus: 'CLOSED', changedBy: IDS.USER_STAFF_FORTIS, notes: 'X-ray confirmed hairline fracture. Cast applied. Discharged same day.', changedAt: daysAgo(113) },
  // Case 3 (dispatched, active)
  { id: 'csh-03a', caseId: IDS.CASE_DISPATCHED, fromStatus: 'TRIGGERED', toStatus: 'TRIGGERED', changedBy: 'system', notes: 'SOS triggered. Chest tightness near Carter Road, Bandra.', changedAt: minutesAgo(25) },
  { id: 'csh-03b', caseId: IDS.CASE_DISPATCHED, fromStatus: 'TRIGGERED', toStatus: 'DISPATCHED', changedBy: 'system', notes: 'Ambulance MH-01-AB-1234 dispatched. Lilavati Hospital ER standing by.', changedAt: minutesAgo(20) },
  // Case 4 (just triggered)
  { id: 'csh-04a', caseId: IDS.CASE_TRIGGERED, fromStatus: 'TRIGGERED', toStatus: 'TRIGGERED', changedBy: 'system', notes: 'SOS triggered. Dizziness near WEH Metro Station.', changedAt: minutesAgo(5) },
];

// ============================================================================
// 9. FOLLOW-UP RECOMMENDATIONS (3)
// ============================================================================
const followUpRecommendations = [
  {
    id: 'fr-001',
    caseId: IDS.CASE_CLOSED_1,
    patientId: IDS.USER_MIHIR,
    recommendedTest: 'Pulmonary Function Test (PFT) Follow-up',
    urgency: 'within_1_week',
    notes: 'Continue Montelukast. Carry rescue inhaler. PFT in 4 weeks to track improvement.',
    recommendingDoctorId: IDS.USER_DR_KAPOOR,
    diagnosticCentreId: IDS.DC_1,
    status: 'COMPLETED',
    bookedAt: daysAgo(149),
    completedAt: daysAgo(145),
    createdAt: daysAgo(150),
  },
  {
    id: 'fr-002',
    caseId: IDS.CASE_CLOSED_2,
    patientId: IDS.USER_PRACHI,
    recommendedTest: 'X-Ray Left Wrist (Repeat) + Orthopedic Review',
    urgency: 'within_2_weeks',
    notes: 'Cast check and repeat X-ray. Watch for swelling/numbness in fingers.',
    recommendingDoctorId: IDS.USER_DR_MEHTA,
    status: 'COMPLETED',
    bookedAt: daysAgo(108),
    completedAt: daysAgo(100),
    createdAt: daysAgo(113),
  },
  {
    id: 'fr-003',
    caseId: IDS.CASE_CLOSED_2,
    patientId: IDS.USER_PRACHI,
    recommendedTest: 'Thyroid Panel Recheck (TSH, Free T4)',
    urgency: 'within_1_month',
    notes: 'TSH was borderline during admission labs. Book endocrinologist if TSH > 6.',
    recommendingDoctorId: IDS.USER_DR_MEHTA,
    diagnosticCentreId: IDS.DC_2,
    status: 'RECOMMENDED',
    createdAt: daysAgo(113),
  },
];

// ============================================================================
// 10. DIAGNOSTIC CENTRES (2)
// ============================================================================
const diagnosticCentres = [
  {
    id: IDS.DC_1,
    name: 'SRL Diagnostics Andheri',
    locationLat: 19.1136,
    locationLng: 72.8697,
    address: 'Plot 22, MIDC Central Road, Andheri East, Mumbai 400093',
    phone: '+912269888888',
    availableTests: ['blood_tests', 'imaging', 'pathology', 'PFT', 'ECG', 'allergy_testing'],
    avgWaitMinutes: 25,
    verified: true,
  },
  {
    id: IDS.DC_2,
    name: 'Thyrocare Central Lab Mumbai',
    locationLat: 19.1862,
    locationLng: 72.9636,
    address: 'D-37/1, TTC Industrial Area, MIDC, Turbhe, Navi Mumbai 400705',
    phone: '+912279696969',
    availableTests: ['blood_tests', 'thyroid_panel', 'lipid_profile', 'diabetes_screening', 'vitamin_panel', 'hormonal_assays'],
    avgWaitMinutes: 15,
    verified: true,
  },
];

// ============================================================================
// 11. QR SCAN LOGS (3) — schema: patientId, scannedAt, resolvedFields
// ============================================================================
const qrScanLogs = [
  { id: 'qr-001', patientId: IDS.USER_PRACHI, scannedAt: daysAgo(114), resolvedFields: ['bloodGroup', 'allergies', 'chronicConditions', 'emergencyContact'] },
  { id: 'qr-002', patientId: IDS.USER_MIHIR, scannedAt: daysAgo(68), resolvedFields: ['bloodGroup', 'allergies', 'medications', 'chronicConditions', 'emergencyContact'] },
  { id: 'qr-003', patientId: IDS.USER_PRACHI, scannedAt: daysAgo(33), resolvedFields: ['bloodGroup', 'allergies', 'medications', 'chronicConditions'] },
];

// ============================================================================
// 12. AUDIT LOGS (6) — schema: actorUserId, actorRole, action, entityType, entityId, metadata, timestamp
// ============================================================================
const auditLogs = [
  { id: 'al-001', actorUserId: IDS.USER_DR_KAPOOR, actorRole: 'DOCTOR', action: 'PROFILE_QR_LOOKUP', entityType: 'EmergencyProfile', entityId: IDS.EP_MIHIR, metadata: { location: 'Apollo Hospital OPD', purpose: 'Pre-consultation review' }, timestamp: daysAgo(68) },
  { id: 'al-002', actorUserId: IDS.USER_STAFF_APOLLO, actorRole: 'HOSPITAL_STAFF', action: 'BED_UPDATED', entityType: 'Hospital', entityId: IDS.H_APOLLO, metadata: { previousFreeBeds: 36, newFreeBeds: 34, reason: 'Two emergency admissions' }, timestamp: hoursAgo(2) },
  { id: 'al-003', actorUserId: IDS.USER_ADMIN, actorRole: 'ADMIN', action: 'EMERGENCY_DISPATCH', entityType: 'EmergencyCase', entityId: IDS.CASE_DISPATCHED, metadata: { ambulanceId: IDS.AMB_1, hospitalId: IDS.H_LILAVATI, severity: 'HIGH' }, timestamp: minutesAgo(20) },
  { id: 'al-004', actorUserId: IDS.USER_DR_MEHTA, actorRole: 'DOCTOR', action: 'PROFILE_QR_LOOKUP', entityType: 'EmergencyProfile', entityId: IDS.EP_PRACHI, metadata: { location: 'Nanavati Hospital OPD', purpose: 'Thyroid follow-up' }, timestamp: daysAgo(33) },
  { id: 'al-005', actorUserId: IDS.USER_MIHIR, actorRole: 'PATIENT', action: 'RECORD_ACCESSED', entityType: 'MedicalRecordEntry', entityId: IDS.MR_MIHIR_LAB, metadata: { recordType: 'lab_report', action: 'uploaded' }, timestamp: daysAgo(43) },
  { id: 'al-006', actorUserId: IDS.USER_STAFF_FORTIS, actorRole: 'HOSPITAL_STAFF', action: 'BED_UPDATED', entityType: 'Hospital', entityId: IDS.H_FORTIS, metadata: { previousFreeBeds: 30, newFreeBeds: 28, reason: 'Scheduled surgery admissions' }, timestamp: hoursAgo(3) },
];

// ============================================================================
// 13. NOTIFICATIONS (4) — schema: caseId, recipient, channel (SMS|WHATSAPP|PUSH|EMAIL), content, sentAt
// ============================================================================
const notifications = [
  { id: 'notif-001', caseId: IDS.CASE_DISPATCHED, recipient: '+919876543210', channel: 'PUSH', content: 'Ambulance MH-01-AB-1234 dispatched to your location. ETA: 8 minutes. Lilavati Hospital ER notified.', sentAt: minutesAgo(20), deliveredAt: minutesAgo(20) },
  { id: 'notif-002', caseId: IDS.CASE_DISPATCHED, recipient: '+919812345678', channel: 'SMS', content: 'HEALTH Alert: Emergency for Mihir. Ambulance dispatched. Track: https://health.app/track/ft-mihir-case3-active', sentAt: minutesAgo(19), deliveredAt: minutesAgo(19) },
  { id: 'notif-003', caseId: IDS.CASE_TRIGGERED, recipient: '+919876543211', channel: 'PUSH', content: 'Your SOS has been registered. AI triage: LOW severity. Finding nearest hospital and ambulance.', sentAt: minutesAgo(5), deliveredAt: minutesAgo(5) },
  { id: 'notif-004', caseId: IDS.CASE_CLOSED_1, recipient: '+919876543210', channel: 'PUSH', content: 'Reminder: Pulmonology follow-up due. Please schedule within 2 days.', sentAt: daysAgo(146), deliveredAt: daysAgo(146) },
];

// ============================================================================
// MAIN SEED FUNCTION
// ============================================================================
async function main() {
  console.log('=== HEALTH Emergency Dispatch System — Database Seed ===\n');

  // Step 1: Clear all data in FK-safe order
  console.log('[1/13] Clearing existing data...');
  await prisma.notification.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.qrScanLog.deleteMany({});
  await prisma.followUpRecommendation.deleteMany({});
  await prisma.caseStatusHistory.deleteMany({});
  await prisma.medicalRecordEntry.deleteMany({});
  await prisma.emergencyCase.deleteMany({});
  await prisma.hospitalSpecialist.deleteMany({});
  await prisma.ambulance.deleteMany({});
  await prisma.diagnosticCentre.deleteMany({});
  await prisma.emergencyProfile.deleteMany({});
  await prisma.hospital.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('  All data cleared.\n');

  // Step 2: Users
  console.log('[2/13] Seeding users...');
  await prisma.user.createMany({ data: users });
  console.log(`  ${users.length} users created.`);

  // Step 3: Emergency profiles
  console.log('[3/13] Seeding emergency profiles...');
  await prisma.emergencyProfile.createMany({ data: emergencyProfiles });
  console.log(`  ${emergencyProfiles.length} profiles created.`);

  // Step 4: Hospitals
  console.log('[4/13] Seeding hospitals...');
  await prisma.hospital.createMany({ data: hospitals });
  console.log(`  ${hospitals.length} hospitals created.`);

  // Step 5: Hospital specialists
  console.log('[5/13] Seeding hospital specialists...');
  await prisma.hospitalSpecialist.createMany({ data: hospitalSpecialists });
  console.log(`  ${hospitalSpecialists.length} specialists created.`);

  // Step 6: Ambulances
  console.log('[6/13] Seeding ambulances...');
  await prisma.ambulance.createMany({ data: ambulances });
  console.log(`  ${ambulances.length} ambulances created.`);

  // Step 7: Medical records
  console.log('[7/13] Seeding medical records...');
  await prisma.medicalRecordEntry.createMany({ data: medicalRecordEntries });
  console.log(`  ${medicalRecordEntries.length} records created.`);

  // Step 8: Emergency cases
  console.log('[8/13] Seeding emergency cases...');
  await prisma.emergencyCase.createMany({ data: emergencyCases });
  console.log(`  ${emergencyCases.length} cases created.`);

  // Step 9: Case status history
  console.log('[9/13] Seeding case status history...');
  await prisma.caseStatusHistory.createMany({ data: caseStatusHistory });
  console.log(`  ${caseStatusHistory.length} history entries created.`);

  // Step 10: Follow-up recommendations
  console.log('[10/13] Seeding follow-up recommendations...');
  await prisma.followUpRecommendation.createMany({ data: followUpRecommendations });
  console.log(`  ${followUpRecommendations.length} recommendations created.`);

  // Step 11: Diagnostic centres
  console.log('[11/13] Seeding diagnostic centres...');
  await prisma.diagnosticCentre.createMany({ data: diagnosticCentres });
  console.log(`  ${diagnosticCentres.length} centres created.`);

  // Step 12: QR scan logs
  console.log('[12/13] Seeding QR scan logs...');
  await prisma.qrScanLog.createMany({ data: qrScanLogs });
  console.log(`  ${qrScanLogs.length} scan logs created.`);

  // Step 13: Audit logs, notifications
  console.log('[13/13] Seeding audit logs & notifications...');
  await prisma.auditLog.createMany({ data: auditLogs });
  await prisma.notification.createMany({ data: notifications });
  console.log(`  ${auditLogs.length} audit logs + ${notifications.length} notifications created.`);

  // Summary
  const total = users.length + emergencyProfiles.length + hospitals.length +
    hospitalSpecialists.length + ambulances.length + medicalRecordEntries.length +
    emergencyCases.length + caseStatusHistory.length + followUpRecommendations.length +
    diagnosticCentres.length + qrScanLogs.length + auditLogs.length + notifications.length;

  console.log('\n=== Seed Complete ===');
  console.log(`Total records: ${total}`);
  console.log(`  Users: ${users.length} | Profiles: ${emergencyProfiles.length} | Hospitals: ${hospitals.length}`);
  console.log(`  Specialists: ${hospitalSpecialists.length} | Ambulances: ${ambulances.length} | Records: ${medicalRecordEntries.length}`);
  console.log(`  Cases: ${emergencyCases.length} | History: ${caseStatusHistory.length} | Follow-ups: ${followUpRecommendations.length}`);
  console.log(`  Diagnostics: ${diagnosticCentres.length} | QR Logs: ${qrScanLogs.length} | Audits: ${auditLogs.length} | Notifications: ${notifications.length}`);
  console.log('\nLogin credentials:');
  console.log('  Patient — mihircodes20@gmail.com (OTP: 123456)');
  console.log('  Patient — prachi.7haa@gmail.com (OTP: 123456)');
  console.log('  Staff   — staff.apollo@health.com (OTP: 123456)');
  console.log('  Staff   — staff.fortis@health.com (OTP: 123456)');
  console.log('  Doctor  — dr.kapoor@health.com (OTP: 123456)');
  console.log('  Doctor  — dr.mehta@health.com (OTP: 123456)');
  console.log('  Admin   — admin@health.com (OTP: 123456)');
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
    console.log('\nDatabase connection closed. Done.');
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('\n=== SEED FAILED ===');
    console.error(error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
