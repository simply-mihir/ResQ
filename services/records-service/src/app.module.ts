import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { RecordsModule } from './records/records.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 15 }]),
    PrismaModule, RecordsModule],
})
export class AppModule {}
