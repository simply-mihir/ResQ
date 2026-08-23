import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { MatchingModule } from './hospital-matching/matching.module';
import { AmbulanceModule } from './ambulance/ambulance.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 15 }]),
    PrismaModule, MatchingModule, AmbulanceModule],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    ],
})
export class AppModule {}
