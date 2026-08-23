const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config({ path: __dirname + '/.env' });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  console.log('Clearing existing data...');
  await prisma.caseStatusHistory.deleteMany();
  await prisma.emergencyCase.deleteMany();
  await prisma.hospitalSpecialist.deleteMany();
  await prisma.ambulance.deleteMany();
  await prisma.hospital.deleteMany();

  console.log('Seeding hospitals...');
  // Mumbai coordinates ~ 19.0760, 72.8777
  const h1 = await prisma.hospital.create({
    data: {
      name: 'Apollo Hospital Mumbai',
      locationLat: 19.075,
      locationLng: 72.877,
      address: 'Navi Mumbai',
      specialties: ['cardiology', 'trauma_surgery', 'neurology'],
      traumaCapable: true,
      bedCapacityTotal: 500,
      bedCapacityFree: 45,
      verifiedPartner: true,
      rating: 4.8,
      specialists: {
        create: [
          { specialty: 'cardiology', available: true },
          { specialty: 'trauma_surgery', available: true },
          { specialty: 'neurology', available: true },
        ]
      }
    }
  });

  const h2 = await prisma.hospital.create({
    data: {
      name: 'Fortis Hospital Mulund',
      locationLat: 19.167,
      locationLng: 72.943,
      address: 'Mulund West',
      specialties: ['general', 'cardiology'],
      traumaCapable: false,
      bedCapacityTotal: 300,
      bedCapacityFree: 12,
      verifiedPartner: true,
      rating: 4.2,
      specialists: {
        create: [
          { specialty: 'general', available: true },
          { specialty: 'cardiology', available: false },
        ]
      }
    }
  });

  const h3 = await prisma.hospital.create({
    data: {
      name: 'Nanavati Super Speciality',
      locationLat: 19.098,
      locationLng: 72.839,
      address: 'Vile Parle West',
      specialties: ['neurology', 'general', 'trauma_surgery'],
      traumaCapable: true,
      bedCapacityTotal: 400,
      bedCapacityFree: 8,
      verifiedPartner: true,
      rating: 4.5,
      specialists: {
        create: [
          { specialty: 'neurology', available: true },
          { specialty: 'general', available: true },
          { specialty: 'trauma_surgery', available: false },
        ]
      }
    }
  });

  console.log('Seeding ambulances...');
  const a1 = await prisma.ambulance.create({
    data: {
      vehicleNumber: 'MH-01-AB-1234',
      status: 'AVAILABLE',
      currentLat: 19.076,
      currentLng: 72.878,
    }
  });

  const a2 = await prisma.ambulance.create({
    data: {
      vehicleNumber: 'MH-02-XY-9999',
      status: 'AVAILABLE',
      currentLat: 19.160,
      currentLng: 72.940,
    }
  });

  console.log('Seeding test case...');
  const c1 = await prisma.emergencyCase.create({
    data: {
      caseNumber: 'HC-TEST-001',
      status: 'TRIAGE_COMPLETE',
      locationLat: 19.080,
      locationLng: 72.880,
      severityTier: 'CRITICAL',
      severityScore: 85,
    }
  });

  console.log('Seeding finished.');
  console.log('Test case ID:', c1.id);
  
  await prisma.$disconnect();
}

main().catch(console.error);
