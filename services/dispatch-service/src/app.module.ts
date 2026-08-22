import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { MatchingModule } from './hospital-matching/matching.module';
import { AmbulanceModule } from './ambulance/ambulance.module';

@Module({
  imports: [PrismaModule, MatchingModule, AmbulanceModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
