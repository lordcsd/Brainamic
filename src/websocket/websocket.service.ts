import { Injectable } from '@nestjs/common';
import {
  EventListener,
  InjectWebSocketProvider,
  OnClose,
  OnError,
  OnOpen,
  WebSocketClient,
} from 'nestjs-websocket';
import { Server } from 'socket.io';

@Injectable()
export class WebSocketService {
  constructor(
    @InjectWebSocketProvider() private readonly twelveDataWS: WebSocketClient,
  ) {}

  listenedPairs = {};
  server: Server;

  getSubscribeString = (symbol: string) =>
    JSON.stringify({
      action: 'subscribe',
      params: { symbols: symbol },
    });

  getUnsubscribeString = (symbol: string) =>
    JSON.stringify({
      action: 'unsubscribe',
      params: { symbols: symbol },
    });

  subscribe(symbol: string) {
    if (this.listenedPairs[symbol]) {
      this.listenedPairs[symbol] += 1;
    } else {
      this.listenedPairs[symbol] = 1;
      this.twelveDataWS.send(this.getSubscribeString(symbol));
    }
  }

  unsubScribe(symbol: string) {
    if (this.listenedPairs[symbol] == 1) {
      this.twelveDataWS.send(this.getUnsubscribeString(symbol));
      delete this.listenedPairs[symbol];
    } else {
      this.listenedPairs[symbol] -= 1;
    }
  }

  @OnOpen()
  open() {
    console.log('connection opened');
    setInterval(() => {
      this.server.send({ action: 'hearbeat' });
    }, 9500);
  }

  @OnError()
  error(err) {
    console.log('Connection due to error', err);
  }

  closed = false;

  @OnClose()
  close() {
    console.log('Connection closed');
    this.closed = true;
  }

  @EventListener('message')
  message(data) {
    data = JSON.parse(data);
    if (data.event == 'price') {
      this.server.sockets.emit(`price@${data.symbol}`, data);
    }
    if (this.closed) {
      console.log(data);
    }
  }
}
