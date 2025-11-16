import { IsEnum, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { TrendDirection } from '../coin.entity';

export class CreateCoinDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  symbol?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsEnum(TrendDirection)
  trend!: TrendDirection;

  @IsOptional()
  @IsUrl({ require_tld: false })
  imageUrl?: string;
}