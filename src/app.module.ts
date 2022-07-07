import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MarketModule } from './market/market.module';
import { UDFModule } from './udf/udf.module';
import { WebsocketModule } from './websocket/webosocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UDFModule,
    MarketModule,
    WebsocketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
