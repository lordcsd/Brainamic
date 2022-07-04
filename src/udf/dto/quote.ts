export interface QuoteValues {
  s: string;
  n: string;
  v: {
    ch: string | number;
    chp: string | number;
    short_name: string;
    exchange: string;
    description: number;
    lp: string | number;
    ask: string | number;
    bid: string | number;
    open_price: string | number;
    high_price: string | number;
    low_price: string | number;
    prev_close_price: string | number;
    volume: string | number;
  };
}

export interface AllQuoteValues {
  s: 'ok';
  d: QuoteValues[];
}
