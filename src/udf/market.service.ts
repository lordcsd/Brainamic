import { Injectable } from '@nestjs/common';
import { UDFService } from './udf.service';
import * as qs from 'qs';
import { getAssetListParams } from './dto/getAssetListParams';
import { stringify } from 'querystring';

@Injectable()
export class MarketService {
  constructor(private udfSerice: UDFService) {}
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

  async getList(params: getAssetListParams) {
    const collectedList = {
      crypto: [],
      forex: [],
      indices: [],
      stock: [],
    };

    if (!params.crypto && !params.forex && !params.indices && !params.stock) {
      collectedList.crypto = await this.getCryptoPairsList();
      collectedList.forex = await this.getStockList();
      collectedList.indices = await this.getIndicesList();
      collectedList.stock = await this.getStockList();
    } else {
      collectedList.crypto = Boolean(params.crypto)
        ? await this.getCryptoPairsList()
        : [];

      collectedList.forex = Boolean(params.forex)
        ? await this.getStockList()
        : [];

      collectedList.indices = Boolean(params.indices)
        ? await this.getIndicesList()
        : [];

      collectedList.stock = Boolean(params.stock)
        ? await this.getStockList()
        : [];
    }

    return {
      data: collectedList,
    };
  }
}
