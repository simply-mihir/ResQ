require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'raushanprateek42@gmail.com';
  
  const admin = await prisma.user.upsert({
    where: { email },
    update: { 
      role: 'ADMIN', 
      verified: true, 
      name: 'Raushan Prateek' 
    },
    create: {
      email,
      name: 'Raushan Prateek',
      role: 'ADMIN',
      verified: true
    },
  });
  
  console.log('Successfully seeded admin user:');
  console.log(admin);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Error seeding admin user:', error);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
