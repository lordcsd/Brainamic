import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { constants } from './common/constants';
import { MarketModule } from './market/market.module';
import { UDFModule } from './udf/udf.module';
import { WebsocketModule } from './websocket/webosocket.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'mysql',
          host: configService.get(constants.database.host),
          // port: +configService.get(constants.database.port),
          username: configService.get(constants.database.username),
          password: configService.get<string>(constants.database.password),
          database: configService.get(constants.database.name),
          entities: [__dirname + '/entities/*.entity{.ts,.js}'],
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    UDFModule,
    MarketModule,
    WebsocketModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
