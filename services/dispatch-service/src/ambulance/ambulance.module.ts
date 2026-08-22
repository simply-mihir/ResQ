import { Module } from '@nestjs/common';
import { AmbulanceController } from './ambulance.controller';
import { DispatchService } from './dispatch.service';

@Module({
  controllers: [AmbulanceController],
  providers: [DispatchService],
  exports: [DispatchService],
})
export class AmbulanceModule {}
