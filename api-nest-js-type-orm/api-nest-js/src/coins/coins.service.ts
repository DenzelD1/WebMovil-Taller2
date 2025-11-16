import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Coin, TrendDirection } from './coin.entity';
import { CreateCoinDto } from './dto/create-coin.dto';
import { QueryCoinsDto } from './dto/query-coins.dto';
import { UpdateCoinDto } from './dto/update-coin.dto';

@Injectable()
export class CoinsService {
  constructor(
    @InjectRepository(Coin)
    private  repo: Repository<Coin>,
  ) {}

  async create(data: CreateCoinDto): Promise<Coin> {
    const coin = this.repo.create(data);
    return this.repo.save(coin);
  }

  async findAll(query: QueryCoinsDto): Promise<Coin[]> {
    const where: FindOptionsWhere<Coin> = {};

    if (query.q) {
      // busqueda por name o symbol
      Object.assign(where, [
        { name: ILike(`%${query.q}%`) },
        { symbol: ILike(`%${query.q}%`) },
      ]);
    }

    if (query.trend) {
      (where as any).trend = query.trend as TrendDirection;
    }

    const qb = this.repo.createQueryBuilder('coin');

    if (query.q) {
      qb.where('coin.name LIKE :q OR coin.symbol LIKE :q', { q: `%${query.q}%` });
    }
    if (query.trend) {
      qb.andWhere('coin.trend = :trend', { trend: query.trend });
    }
    if (query.minPrice !== undefined) {
      qb.andWhere('coin.price >= :minPrice', { minPrice: query.minPrice });
    }
    if (query.maxPrice !== undefined) {
      qb.andWhere('coin.price <= :maxPrice', { maxPrice: query.maxPrice });
    }

    qb.orderBy('coin.price', 'DESC');

    const limit = query.limit ?? 50;
    qb.limit(limit);

    return qb.getMany();
  }

  async findOne(id: number): Promise<Coin> {
    const coin = await this.repo.findOne({ where: { id } });
    if (!coin) throw new NotFoundException('Moneda no encontrada');
    return coin;
  }

  async remove(id: number): Promise<void> {
    const result = await this.repo.delete(id);
    if (!result.affected) throw new NotFoundException('Moneda no encontrada');
  }

  async update(id: number, changes: UpdateCoinDto): Promise<Coin> {
    const coin = await this.findOne(id);
    Object.assign(coin, changes);
    return this.repo.save(coin);
  }
}