import { Module } from '@nestjs/common';
import { SharedModule } from 'src/common/sharedModule';
import { MarketService } from './market.service';
import { UDFController } from './udf.controller';
import { UDFService } from './udf.service';

@Module({
  imports: [SharedModule],
  providers: [UDFService, MarketService],
  controllers: [UDFController],
})
export class UDFModule {}
