import { SharedEntity } from 'src/common/model/sharedEntity';
import { Column, Entity } from 'typeorm';

export enum instrumentType {
  crypto = 'crypto',
  forex = 'forex',
  indices = 'indices',
  stock = 'stock',
}

@Entity()
export class InstrumentList extends SharedEntity {
  @Column({ nullable: false, unique: true })
  symbol: string;

  @Column()
  ticker: string;

  @Column()
  name: string;

  @Column()
  full_name: string;

  @Column()
  description: string;

  @Column()
  exchange: string;

  @Column()
  currency_code: string;

  @Column()
  listed_exchange: string;

  @Column({ type: 'enum', enum: instrumentType })
  type: instrumentType;
}
