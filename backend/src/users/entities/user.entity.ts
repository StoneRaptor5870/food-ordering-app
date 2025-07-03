import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Order } from "../../orders/entities/order.entity";
import { UserRole, Country } from "../../common/enums";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column()
  name: string;

   @Column({ 
    type: 'enum', 
    enum: UserRole,
    default: UserRole.MEMBER 
  })
  role: UserRole;

  @Column({ type: 'enum', enum: Country })
  country: Country;

  @Column({ nullable: true, default: "Card", select: false })
  paymentMethod?: string;

  @OneToMany(() => Order, order => order.user)
  orders: Order[]
}