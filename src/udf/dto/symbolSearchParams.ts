import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class symbolSearchParams {
  @ApiProperty({
    type: String,
    description: 'Search string',
    default: 'BTC/USD',
  })
  @IsString()
  query: string; //user input

  @ApiPropertyOptional({
    type: String,
    description: 'Leave this blank',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Leave this blank',
  })
  @IsString()
  @IsOptional()
  exchange?: string;

  @ApiPropertyOptional({
    type: Number,
    description:
      'Maximum number of symbols to return,Default is 30 and 120 maximum',
    default: 30,
  })
  @IsNumberString()
  @IsOptional()
  limit?: number;
}

export interface SymbolSearchObject {
  symbol: string;
  full_name: string;
  description: string;
  exchange: string;
  ticker: string;
  type: string;
}
