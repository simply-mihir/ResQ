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
  await prisma.ambulance.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.emergencyCase.deleteMany();

  console.log('Seeding hospitals...');
  // Mumbai coordinates ~ 19.0760, 72.8777
  const h1 = await prisma.hospital.create({
    data: {
      name: 'Apollo Hospital Mumbai',
      locationLat: 19.075,
      locationLng: 72.877,
      address: 'Navi Mumbai',
      specialties: ['Cardiology', 'Orthopedics', 'Neurology'],
      traumaCapable: true,
      bedCapacityTotal: 500,
      bedCapacityFree: 45,
      verifiedPartner: true,
    }
  });

  const h2 = await prisma.hospital.create({
    data: {
      name: 'Fortis Hospital Mulund',
      locationLat: 19.167,
      locationLng: 72.943,
      address: 'Mulund West',
      specialties: ['Emergency Medicine', 'Pediatrics'],
      traumaCapable: false,
      bedCapacityTotal: 300,
      bedCapacityFree: 12,
      verifiedPartner: true,
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
