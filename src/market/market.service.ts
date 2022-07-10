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
import { DataSource, Repository } from 'typeorm';
import { InstrumentList } from 'src/entities/instrumentList.entity';

@Injectable()
export class MarketService {
  instrumentListRepo: Repository<InstrumentList>;
  constructor(
    private udfSerice: UDFService,
    private httpService: HttpService,
    private dataSource: DataSource,
  ) {
    this.instrumentListRepo = dataSource.getRepository(InstrumentList);
  }

  async upsertList(data: any[]) {
    return await this.instrumentListRepo.upsert(data, {
      conflictPaths: ['symbol'],
      skipUpdateIfNoValuesChanged: true,
    });
  }

  //get cyrpto symbols
  async getCryptoPairsList() {
    const options = { exchange: 'binance' };
    const url = `${
      this.udfSerice.twelveDataRoot
    }/cryptocurrencies?${qs.stringify(options)}`;
    const { data } = await this.udfSerice.httpGet(url);
    return data.map((_symbol) => ({
      symbol: _symbol.symbol,
      ticker: _symbol.symbol,
      full_name: _symbol.currency_base,
      name: _symbol.currency_base,
      description: _symbol.currency_base,
      exchange: 'Binance',
      currency_code: _symbol.symbol,
      listed_exchange: 'Binance',
      type: instrumentType.crypto,
    }));
  }

  //get index symbols
  async getIndicesList() {
    const url = `${this.udfSerice.twelveDataRoot}/indices`;
    const { data } = await this.udfSerice.httpGet(url);
    return data.map((_symbol) => ({
      symbol: _symbol.symbol,
      ticker: _symbol.symbol,
      full_name: _symbol.name,
      name: _symbol.name,
      description: _symbol.name,
      exchange: '',
      currency_code: _symbol.currency,
      listed_exchange: '',
      type: instrumentType.indices,
    }));
  }

  //get stock symbols
  async getStockList() {
    const options = { exchange: 'NYSE' };
    const url = `${this.udfSerice.twelveDataRoot}/stocks?${qs.stringify(
      options,
    )}`;
    const { data } = await this.udfSerice.httpGet(url);
    return data.map((_symbol) => ({
      symbol: _symbol.symbol,
      ticker: _symbol.symbol,
      full_name: _symbol.name,
      name: _symbol.name,
      description: _symbol.name,
      exchange: _symbol.exchange,
      currency_code: _symbol.currency,
      listed_exchange: _symbol.exchange,
      type: instrumentType.stock,
    }));
  }

  //get forex symbols
  async getForexList() {
    const url = `${this.udfSerice.twelveDataRoot}/forex_pairs`;
    const { data } = await this.udfSerice.httpGet(url);
    return data.map((_symbol) => ({
      symbol: _symbol.symbol,
      ticker: _symbol.symbol,
      full_name: _symbol.currency_base,
      name: _symbol.currency_base,
      description: _symbol.currency_base,
      exchange: '',
      currency_code: _symbol.symbol,
      listed_exchange: '',
      type: instrumentType.forex,
    }));
  }

  async fetchList(type: string) {
    let returned = [];
    if (type == instrumentType.crypto) {
      returned = await this.getCryptoPairsList();
    }
    if (type == instrumentType.forex) returned = await this.getForexList();
    if (type == instrumentType.indices) returned = await this.getIndicesList();
    if (type == instrumentType.stock) returned = await this.getStockList();

    return returned;
  }

  //refresh list on database
  async refreshLists() {
    const types = [
      instrumentType.crypto,
      instrumentType.forex,
      instrumentType.indices,
      instrumentType.stock,
    ];
    for (const type of types) {
      await this.upsertList(this.fetchList[type]);
    }
  }

  // localQuotes: { any: { data: quoteStruct } } = {} ;
  localQuotes = {};

  expired(timestamp: number, duration: 'day' | '2min') {
    return +new Date() - timestamp > (duration == 'day' ? 86400000 : 120000);
  }

  async getList(
    params: getAssetListParams,
  ): Promise<BrainamicResponseOk | BrainamicResponseError> {
    try {
      const { type } = params;

      const returned = await this.instrumentListRepo.find({
        where: { type: type },
      });
      // const returned = await this.fetchList(type);

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

  //refresh lists on database as soon as service starts
  refresh = this.refreshLists()
    .then((res) => {
      console.log('Refreshed instrument lists');
    })
    .catch((err) => console.log('There was an error refreshing lists', err));

  //refresh lists on database every 24hours
  refreshEveryDay = setInterval(() => {
    this.refreshLists()
      .then((res) => {
        console.log('Refreshed instrument lists');
      })
      .catch((err) => console.log('There was an error refreshing lists', err));
  }, 1000 * 60 * 60 * 24);
}
