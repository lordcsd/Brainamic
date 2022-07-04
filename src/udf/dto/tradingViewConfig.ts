export interface TradingViewConfig {
  exchanges: {
    value: string;
    name: string;
    desc: string;
  }[];
  symbols_types: [
    {
      value: string;
      name: string;
    },
  ];
  supported_resolutions: string[];
  supports_search: boolean;
  supports_group_request: boolean;
  supports_marks: boolean;
  supports_timescale_marks: boolean;
  supports_time: boolean;
}
