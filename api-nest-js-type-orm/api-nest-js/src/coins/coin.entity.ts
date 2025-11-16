import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export enum TrendDirection {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable',
}

@Entity({ name: 'coins' })
export class Coin {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  name!: string;

  @Column({ unique: true, nullable: true })
  symbol?: string;

  @Column({ type: 'float' })
  price!: number;

  @Column({ type: 'simple-enum', enum: TrendDirection, default: TrendDirection.STABLE })
  trend!: TrendDirection;

  @Column({ name: 'image_url', nullable: true })
  imageUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}