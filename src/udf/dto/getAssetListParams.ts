import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, MinLength } from 'class-validator';

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
    description: 'List of symbols',
    default: ['BTC/USD'],
    type: Array,
  })
  @IsArray()
  @MinLength(0)
  symbols: string[];
}
