import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity()
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  image: string;

  @Column()
  category: string;

  @Column({ default: true })
  available: boolean;

  @Column()
  restaurantId: number;

  @ManyToOne(() => Restaurant, restaurant => restaurant.menuItems)
  @JoinColumn({ name: 'restaurantId' })
  restaurant: Restaurant;
}