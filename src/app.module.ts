import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UDFModule } from './udf/udf.module';
import { WebsocketModule } from './websocket/webosocket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UDFModule,
    WebsocketModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
