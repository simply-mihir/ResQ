import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { RecordsModule } from './records/records.module';

@Module({
  imports: [PrismaModule, RecordsModule],
})
export class AppModule {}
