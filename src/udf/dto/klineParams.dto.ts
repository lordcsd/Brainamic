import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class KlineParams {
  @ApiProperty({
    type: String,
    description: 'The symbol to get the data for',
    default: 'BTC/USD',
  })
  @IsString()
  symbol: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'StartTime of kline data',
    default: 1572651390,
  })
  @IsNumberString()
  @IsOptional()
  from?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Endtime of kline data, most times set to the present time',
    default: 1575243390,
  })
  @IsNumberString()
  @IsOptional()
  to?: number;

  @ApiProperty({
    type: String,
    description: 'Kline interval,1, 5, 15, 30, 60, D, W, M ',
    default: '60',
  })
  @IsString()
  resolution: string; //interval

  @ApiPropertyOptional({
    type: Number,
    description: 'How many bars to return a.k.a LIMIT',
    default: 5000,
  })
  @IsNumberString()
  @IsOptional()
  countback?: number; //number of bars to return, if set from is ignored

  @ApiProperty({
    type: String,
    description: 'Exchange where pair is traded',
    default: 'BINANCE',
  })
  @IsString()
  exchange: string;
}

export interface KlineResponseOK {
  c: string | number[];
  h: string | number[];
  l: string | number[];
  o: string | number[];
  s: string;
  t: string | number[];
  v: string | number[];
}

export interface KlineResponseNoData {
  s: string;
}
