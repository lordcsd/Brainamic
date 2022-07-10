import { instrumentType } from './getAssetListParams';

export class instrumentListStruct {
  symbol: string;
  ticker: string;
  name: string;
  full_name: string;
  description: string;
  exchange: string;
  currency_code: string;
  listed_exchange: string;
  type: instrumentType;
}
