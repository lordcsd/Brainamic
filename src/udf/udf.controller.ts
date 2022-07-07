import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { getAssetListParams } from './dto/getAssetListParams';
import { KlineParams } from './dto/klineParams.dto';
import { symbolSearchParams } from './dto/symbolSearchParams';
import { MarketService } from '../market/market.service';
import { UDFService } from './udf.service';

@ApiTags('UDF')
@Controller()
export class UDFController {
  constructor(private udfService: UDFService) {}

  @Get('/')
  async root() {
    return 'this is the root url, try config, time, symbol_info etc';
  }

  //get server time
  @Get('/time')
  async getServerTime() {
    return this.udfService.getServerTime();
  }

  //bars or Kline
  @Get('/history')
  async getKlineBar(@Query() params: KlineParams) {
    return this.udfService.getKlineData(params);
  }

  @Get('/config')
  async getConfig() {
    return this.udfService.getConfig();
  }

  //resolve symbol
  @Get('/symbols')
  async resolveSymbol(@Query('symbol') symbol: string) {
    return await this.udfService.resolveSymbol(symbol);
  }

  //get symbol info
  @Get('/symbol_info')
  async getSymbolInfo(@Query('group') group: string) {
    return await this.udfService.getSymbolInfo(group);
  }

  //search symbols
  @Get('/search')
  async searchSymbols(@Query() params: symbolSearchParams) {
    return this.udfService.searchSymbols(params);
  }

  //Quote: Symbol daily price info
  @Get('/quotes')
  async getQuotes(@Query('symbols') symbols: string) {
    return this.udfService.quote(symbols);
  }
}
