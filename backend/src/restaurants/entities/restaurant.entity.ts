import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MenuItem } from './menuItem.entity';
import { Country } from '../../common/enums'

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  address: string;

  @Column()
  image: string;

  @Column({ type: 'enum', enum: Country, default: Country.INDIA })
  country: Country;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 4.0 })
  rating: number;

  @OneToMany(() => MenuItem, menuItem => menuItem.restaurant, { cascade: true })
  menuItems: MenuItem[];
}