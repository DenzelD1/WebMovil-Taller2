import { Controller, Get, Post, Delete, Patch, Param, Body, Query, ParseIntPipe } from '@nestjs/common';
import { CoinsService } from './coins.service';
import { CreateCoinDto } from './dto/create-coin.dto';
import { QueryCoinsDto } from './dto/query-coins.dto';
import { UpdateCoinDto } from './dto/update-coin.dto';
import { Coin } from './coin.entity';

@Controller('coins')
export class CoinsController {
  constructor(private readonly service: CoinsService) {}

  @Post()
  create(@Body() dto: CreateCoinDto): Promise<Coin> {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryCoinsDto): Promise<Coin[]> {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Coin> {
    return this.service.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.service.remove(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCoinDto,
  ): Promise<Coin> {
    return this.service.update(id, dto);
  }
}