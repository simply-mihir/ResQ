import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { EmergencyModule } from './emergency/emergency.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [PrismaModule, EmergencyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
