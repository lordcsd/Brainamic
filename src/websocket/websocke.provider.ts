import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebSocketService } from './websocket.service';

@WebSocketGateway({ cors: true })
export class WebsocketProvider
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private webSocketService: WebSocketService) {}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server, socket: Socket) {
    console.log('socket ready');
    this.webSocketService.server = this.server;
  }

  handleDisconnect(client: Socket) {
    this.webSocketService.unsubScribe(client['symbol']);
  }

  handleConnection(client: Socket) {
    const symbol = client.handshake.query.symbol as string;
    client['symbol'] = symbol;
    this.webSocketService.subscribe(symbol);
  }
}
