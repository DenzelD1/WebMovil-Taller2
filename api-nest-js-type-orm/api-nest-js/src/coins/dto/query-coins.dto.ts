import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { TrendDirection } from '../coin.entity';

export class QueryCoinsDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(TrendDirection)
  trend?: TrendDirection;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;
}