import { Injectable } from '@nestjs/common';
import * as qs from 'qs';
import {
  getAssetListParams,
  instrumentType,
} from '../udf/dto/getAssetListParams';
import { UDFService } from 'src/udf/udf.service';
import { firstValueFrom, map } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import {
  BrainamicResponseError,
  BrainamicResponseOk,
} from 'src/common/returnTemplate';
import { quoteStruct } from './dtos/quoteStruct';

@Injectable()
export class MarketService {
  constructor(
    private udfSerice: UDFService,
    private httpService: HttpService,
  ) {}

  //get cyrpto symbols
  async getCryptoPairsList() {
    const options = { exchange: 'binance' };
    const url = `${
      this.udfSerice.twelveDataRoot
    }/cryptocurrencies?${qs.stringify(options)}`;
    const { data } = await this.udfSerice.httpGet(url);
    return data;
  }
  //get index symbols
  async getIndicesList() {
    const url = `${this.udfSerice.twelveDataRoot}/indices`;
    const { data } = await this.udfSerice.httpGet(url);
    return data;
  }

  //get stock symbols
  async getStockList() {
    const options = { exchange: 'NYSE' };
    const url = `${this.udfSerice.twelveDataRoot}/stocks?${qs.stringify(
      options,
    )}`;
    const { data } = await this.udfSerice.httpGet(url);
    return data;
  }

  //get forex symbols
  async getForexList() {
    const url = `${this.udfSerice.twelveDataRoot}/forex_pairs`;
    const { data } = await this.udfSerice.httpGet(url);
    return data;
  }

  localLists = {
    crypto: { data: [], created: 0 },
    forex: { data: [], created: 0 },
    indices: { data: [], created: 0 },
    stock: { data: [], created: 0 },
  };

  // localQuotes: { any: { data: quoteStruct } } = {} ;
  localQuotes = {};

  expired(timestamp: number, duration: 'day' | '2min') {
    return +new Date() - timestamp > (duration == 'day' ? 86400000 : 120000);
  }

  async fetchList(type: string) {
    let returned = [];
    if (type == instrumentType.crypto) {
      returned = await this.getCryptoPairsList();
    }
    if (type == instrumentType.forex) returned = await this.getForexList();
    if (type == instrumentType.indices) returned = await this.getIndicesList();
    if (type == instrumentType.stock) returned = await this.getStockList();

    this.localLists[type].data = returned;
    this.localLists[type].created = +new Date();
    return returned;
  }

  async getList(
    params: getAssetListParams,
  ): Promise<BrainamicResponseOk | BrainamicResponseError> {
    try {
      const { type } = params;

      let returned;
      if (this.expired(this.localLists[type].created, 'day')) {
        returned = await this.fetchList(type);
      } else {
        returned = this.localLists[type].data;
      }

      return {
        status: 201,
        message: 'List fetched successfully',
        data: returned,
      };
    } catch (err) {
      console.log(err);
      return {
        status: 500,
        message: 'Error fetching list',
        error: 'Internal Server error',
      };
    }
  }

  async getPriceAndVolume(
    symbols: string[],
  ): Promise<BrainamicResponseOk | BrainamicResponseError> {
    try {
      const url = `${this.udfSerice.twelveDataRoot}/complex_data?apikey=${this.udfSerice.twelveDataAPIKey}`;

      symbols = typeof symbols == 'string' ? [symbols] : symbols;

      const options = JSON.stringify({
        symbols: symbols,
        intervals: ['1day'],
        outputsize: 1,
        methods: ['quote'],
      });

      let response: quoteStruct[] = [];

      const allAvailableLocally =
        symbols
          .filter((_symbol) => this.localQuotes[_symbol])
          .filter((_symbol) => !this.expired(_symbol['timestamp'], '2min'))
          .length == symbols.length;

      if (allAvailableLocally) {
        response = Object.values(this.localQuotes).filter((_quote) =>
          symbols.includes(_quote['symbol']),
        ) as quoteStruct[];
      } else {
        const quoteData = await firstValueFrom(
          this.httpService.post(url, options).pipe(map((res) => res.data)),
        );

        const { data } = quoteData;

        response = data.map((quote) => {
          return {
            symbol: quote.symbol,
            name: quote.name,
            volume: quote.volume,
            price: +quote.previous_close + +quote.change,
            timestamp: quote.timestamp,
          };
        });

        response.forEach((_quote: quoteStruct) => {
          this.localQuotes[_quote.symbol] = _quote;
        });
      }

      return {
        status: 201,
        message: 'Price and volume data fetched',
        data: response,
      };
    } catch (err) {
      return {
        status: 500,
        message: 'There was an issue getting data',
        error: 'internal server error',
      };
    }
  }
}
