import { Module } from '@nestjs/common';
import { SharedModule } from 'src/common/sharedModule';
import { UDFController } from './udf.controller';
import { UDFService } from './udf.service';

@Module({
  imports: [SharedModule],
  providers: [UDFService],
  controllers: [UDFController],
  exports: [UDFService],
})
export class UDFModule {}
