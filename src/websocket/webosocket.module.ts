import { Module } from '@nestjs/common';
import { WebsocketProvider } from './websocke.provider';
import { WebSocketService } from './websocket.service';
import { WebSocketModule } from 'nestjs-websocket';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { constants } from 'src/common/constants';

const twelveDataSocketClientModule = WebSocketModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    return {
      url: `${configService.get(
        constants.twelveData.wsRoot,
      )}/quotes/price?apikey=${configService.get(constants.twelveData.apiKey)}`,
    };
  },
});

@Module({
  imports: [twelveDataSocketClientModule],
  providers: [WebsocketProvider, WebSocketService],
})
export class WebsocketModule {}
