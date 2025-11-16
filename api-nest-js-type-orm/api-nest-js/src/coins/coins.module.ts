import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Coin } from './coin.entity';
import { CoinsService } from './coins.service';
import { CoinsController } from './coins.controller';
import { CoinsSeedService } from './coins.seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Coin])],
  providers: [CoinsService, CoinsSeedService],
  controllers: [CoinsController],
})
export class CoinsModule {}