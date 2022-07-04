import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class getAssetListParams {
  @ApiPropertyOptional({
    type: Boolean,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  indices?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  crypto?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  forex?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  stock?: boolean;
}
