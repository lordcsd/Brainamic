export interface TradingViewSymbolInfo {
  symbol: string[];
  ticker: string[];
  name: string[];
  full_name: string[];
  description: string[];
  exchange: string | string[];
  listed_exchange: string | string[];
  type: string | string[];
  currency_code: string[];
  session: string;
  timezone: string;
  minmovement: number;
  minmov: number;
  minmovement2: number;
  minmov2: number;
  pricescale: number;
  supported_resolutions: string[];
  has_intraday: boolean;
  has_daily: boolean;
  has_weekly_and_monthly: boolean;
  data_status: string;
}
