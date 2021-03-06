import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom, map } from 'rxjs';
import { constants } from '../common/constants';
import {
  KlineParams,
  KlineResponseNoData,
  KlineResponseOK,
} from './dto/klineParams.dto';
import { getTwelveDataInterval } from './functions/getTwelveDataResolution';
import { epochDateToString, stringToEpoch } from './functions/reformatDate';
import * as qs from 'qs';
import { symbolSearchParams } from './dto/symbolSearchParams';
import { AllQuoteValues, QuoteValues } from './dto/quote';
import { TradingViewConfig } from './dto/tradingViewConfig';
import { tradingViewIntervals } from './dto/intervals.dto';
import { TradingViewSymbolInfo } from './dto/tradingViewSymbolInfo';
import { ResolveSymbolResponse } from './dto/resolveSymbol.dto';
import { DataSource, Repository } from 'typeorm';
import { InstrumentList } from 'src/entities/instrumentList.entity';

@Injectable()
export class UDFService {
  twelveDataRoot: string;
  twelveDataAPIKey: string;
  instrumentListRepo: Repository<InstrumentList>;
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {
    this.twelveDataRoot = this.configService.get(constants.twelveData.baseURL);
    this.twelveDataAPIKey = this.configService.get(constants.twelveData.apiKey);
    this.instrumentListRepo = dataSource.getRepository(InstrumentList);
  }

  async httpGet(url: string) {
    return await firstValueFrom(
      this.httpService.get(url).pipe(map((res) => res.data)),
    );
  }

  //server time
  getServerTime(): string {
    return Math.floor(Date.now() / 1000).toString();
  }

  //kline
  async getKlineData(
    params: KlineParams,
  ): Promise<KlineResponseOK | KlineResponseNoData> {
    try {
      const queryParams = {
        symbol: params.symbol,
        interval: getTwelveDataInterval(params.resolution),
        start_date: epochDateToString(params.from ? +params.from * 1000 : 0),
        end_date: epochDateToString(
          params.to ? +params.to * 1000 : +new Date(),
        ),
        apikey: this.twelveDataAPIKey,
        outputsize: +params.countback || 500,
        exchange: params.exchange,
      };

      const url = `${this.twelveDataRoot}/time_series?${qs.stringify(
        queryParams,
      )}`;

      const response = await this.httpGet(url);

      if (response.values) {
        const data: KlineResponseOK = {
          t: response.values.map(
            (value) => stringToEpoch(value.datetime) / 1000,
          ),
          o: response.values.map((value) => value.open),
          h: response.values.map((value) => value.high),
          l: response.values.map((value) => value.low),
          c: response.values.map((value) => value.close),
          v: response.values.map((value) => value.volume || 0),
          s: 'ok',
        };
        return data;
      }
      return { s: 'no_data' };
    } catch (e) {
      console.log(e);
    }
  }

  //trading view config
  async getConfig(): Promise<TradingViewConfig> {
    const url = `${this.twelveDataRoot}/exchanges?source=docs`;
    const _exchanges = await this.httpGet(url);

    console.log(_exchanges);
    const config: TradingViewConfig = {
      exchanges: [
        {
          value: 'BINANCE',
          name: 'binance',
          desc: 'binance Exchange',
        },
        {
          value: 'NYSE',
          name: 'NYSE',
          desc: 'NYSE',
        },
        {
          value: 'NYSE',
          name: 'NYSE',
          desc: 'NYSE',
        },
        {
          value: 'NYSE',
          name: 'NYSE',
          desc: 'NYSE',
        },
      ],
      symbols_types: [
        {
          value: 'crypto',
          name: 'Cryptocurrency',
        },
        {
          value: 'forex',
          name: 'Forex',
        },
        {
          value: 'Indices',
          name: 'Indices',
        },
        {
          value: 'Stock',
          name: 'Stock',
        },
      ],
      supported_resolutions: tradingViewIntervals,
      supports_search: true,
      supports_group_request: false,
      supports_marks: false,
      supports_timescale_marks: false,
      supports_time: true,
    };
    return config;
  }

  //get symbol info
  async getSymbolInfo(group: string): Promise<TradingViewSymbolInfo> {
    const instruments = await this.instrumentListRepo.find();
    const symbolInformation: TradingViewSymbolInfo = {
      symbol: instruments.map((instruments) => instruments.symbol),
      ticker: instruments.map((instruments) => instruments.ticker),
      name: instruments.map((instruments) => instruments.name),
      full_name: instruments.map((instruments) => instruments.full_name),
      description: instruments.map((instruments) => instruments.description),
      exchange: instruments.map((instruments) => instruments.exchange),
      listed_exchange: instruments.map(
        (instruments) => instruments.listed_exchange,
      ),
      type: instruments.map((instruments) => instruments.type),
      currency_code: instruments.map(
        (instruments) => instruments.currency_code,
      ),
      session: '24x7',
      timezone: 'UTC',
      minmovement: 1,
      minmov: 1,
      minmovement2: 0,
      minmov2: 0,
      pricescale: 10,
      supported_resolutions: tradingViewIntervals,
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: true,
      data_status: 'streaming',
    };
    return symbolInformation;
  }

  //resolve symbol
  async resolveSymbol(symbol: string) {
    const url = `${this.twelveDataRoot}/profile?symbol${symbol}&apikey=${this.twelveDataAPIKey}`;
    const response = await this.httpGet(url);

    const symbolInformation: ResolveSymbolResponse = {
      symbol: response.symbol,
      ticker: response.symbol,
      name: response.symbol,
      full_name: response.symbol,
      description: response.description,
      exchange: response.exchange,
      listed_exchange: response.exchange,
      type: response.type,
      currency_code: response.symbol,
      session: '24x7',
      timezone: 'UTC',
      minmovement: 1,
      minmov: 1,
      minmovement2: 0,
      minmov2: 0,
      pricescale: 100,
      supported_resolutions: tradingViewIntervals,
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: true,
      data_status: 'streaming',
    };
    return symbolInformation;
  }

  //search
  async searchSymbols(params: symbolSearchParams) {
    try {
      const queryParams = {
        symbol: params.query,
        outputsize: params.limit,
      };

      const url = `${this.twelveDataRoot}/symbol_search?${qs.stringify(
        queryParams,
      )}`;

      const response = await this.httpGet(url);

      return response.data.map((instrument) => {
        return {
          symbol: instrument.symbol,
          full_name: instrument.instrument_name,
          description: instrument.symbol,
          exchange: instrument.exchange,
          ticker: instrument.symbol,
          type: instrument.instrument_type,
        };
      });
    } catch (e) {}
  }

  //quote
  async quote(symbols: string): Promise<AllQuoteValues> {
    try {
      const symbolList = symbols.includes('%') ? symbols.split('%') : [symbols];

      const quoteList: QuoteValues[] = [];

      for (const symbol of symbolList) {
        const queryParams = {
          symbol: symbol,
          apikey: this.twelveDataAPIKey,
        };

        const url = `${this.twelveDataRoot}/quote?${qs.stringify(queryParams)}`;
        const response = await this.httpGet(url);

        if (response.change && response.symbol) {
          const data: QuoteValues = {
            s: 'ok',
            n: response.exchange,
            v: {
              ch: response.change,
              chp: response.percent_change,
              short_name: response.symbol,
              exchange: response.exchange,
              description: response.symbol,
              lp: response.previous_close,
              ask: +response.previous_close + +response.change, //still under consideration
              bid: +response.previous_close + +response.change, //still under consideration
              open_price: response.open,
              high_price: response.high,
              low_price: response.low,
              prev_close_price: response.previous_close,
              volume: response.volume || 0,
            },
          };

          quoteList.push(data);
        }
      }

      return {
        s: 'ok',
        d: quoteList,
      };
    } catch (e) {
      console.log(e);
    }
  }
}
