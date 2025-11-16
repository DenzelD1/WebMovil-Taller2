import { IsEnum, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { TrendDirection } from '../coin.entity';

export class UpdateCoinDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  symbol?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsEnum(TrendDirection)
  trend?: TrendDirection;

  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;
}