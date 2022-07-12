import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsString, MinLength } from 'class-validator';

export enum instrumentType {
  crypto = 'crypto',
  forex = 'forex',
  indices = 'indices',
  stock = 'stock',
}
export class getAssetListParams {
  @ApiProperty({
    description: 'Type of instrument to be fetched',
    enum: instrumentType,
    default: instrumentType.crypto,
  })
  @IsEnum(instrumentType)
  type: instrumentType;
}

export class getPriceAndVolume {
  @ApiProperty({
    description:
      'List of symbols, takes a single symbol or a string of symbols seperated with the percentage "%" sign',
    default: 'BTC/USD%ETH/USD',
    type: String,
  })
  @IsString()
  symbols: string;
}
