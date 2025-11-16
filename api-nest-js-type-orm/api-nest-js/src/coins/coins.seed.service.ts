import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coin, TrendDirection } from './coin.entity';

@Injectable()
export class CoinsSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(CoinsSeedService.name);

  constructor(
    @InjectRepository(Coin)
    private readonly repo: Repository<Coin>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      const count = await this.repo.count();
      if (count > 0) {
        this.logger.log(`Seed omitido: ya existen ${count} monedas.`);
        return;
      }

      const defaults: Partial<Coin>[] = [
        { name: 'Bitcoin', symbol: 'BTC', price: 70000, trend: TrendDirection.UP },
        { name: 'Ethereum', symbol: 'ETH', price: 3500, trend: TrendDirection.UP },
        { name: 'Tether', symbol: 'USDT', price: 1, trend: TrendDirection.STABLE },
        { name: 'Solana', symbol: 'SOL', price: 180, trend: TrendDirection.UP },
      ];

      await this.repo.save(defaults);
      this.logger.log(`Seed completado: insertadas ${defaults.length} monedas.`);
    } catch (err) {
      this.logger.error('Fallo al ejecutar el seed de monedas', err instanceof Error ? err.stack : String(err));
    }
  }
}