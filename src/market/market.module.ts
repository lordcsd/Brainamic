import { Module } from '@nestjs/common';
import { SharedModule } from 'src/common/sharedModule';
import { UDFModule } from 'src/udf/udf.module';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';

@Module({
  imports: [SharedModule, UDFModule],
  controllers: [MarketController],
  providers: [MarketService],
})
export class MarketModule {}
