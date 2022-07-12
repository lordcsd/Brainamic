import { Body, Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  getAssetListParams,
  getPriceAndVolume,
} from 'src/udf/dto/getAssetListParams';
import { MarketService } from './market.service';

@ApiTags('Market')
@Controller()
export class MarketController {
  constructor(private marketService: MarketService) {}

  @Get('/get-assets-list')
  async getAssets(@Query() params: getAssetListParams) {
    return await this.marketService.getList(params);
  }

  @Get('/get-price-and-volume')
  async getPriceAndVolume(@Query() params: getPriceAndVolume) {
    return await this.marketService.getPriceAndVolume(params.symbols);
  }
}
