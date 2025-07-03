import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/orderItem.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums';
import { MenuItem } from '../restaurants/entities/menuItem.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { CreateOrderDto } from './dto/createOrder.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) { }

  async create(createOrderDto: CreateOrderDto, user: User): Promise<Order | null> {
  const { restaurantId, items, deliveryAddress } = createOrderDto;

  // console.log('Creating order for user:', user.id, user.email);

  return await this.dataSource.transaction(async manager => {
    const restaurant = await manager.findOne(Restaurant, {
      where: { id: restaurantId }
    });

    if (!restaurant) {
      throw new BadRequestException(`Restaurant ${restaurantId} not found`);
    }

    if (user.role !== UserRole.ADMIN && restaurant.country !== user.country) {
      throw new ForbiddenException('Cannot order from restaurants in other countries');
    }

    if (!items || items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    let totalAmount = 0;
    const orderItemsData: Array<{
      menuItem: MenuItem;
      quantity: number;
      price: number;
    }> = [];

    for (const item of items) {
      const menuItem = await manager.findOne(MenuItem, {
        where: {
          id: item.menuItemId,
          restaurant: { id: restaurantId }
        },
        relations: ['restaurant']
      });

      if (!menuItem) {
        throw new BadRequestException(`Menu item ${item.menuItemId} not found in restaurant ${restaurantId}`);
      }

      if (item.quantity <= 0) {
        throw new BadRequestException('Item quantity must be greater than 0');
      }

      const itemTotal = menuItem.price * item.quantity;
      totalAmount += itemTotal;

      orderItemsData.push({
        menuItem,
        quantity: item.quantity,
        price: menuItem.price
      });
    }

    const order = manager.create(Order, {
      user: { id: user.id },
      restaurant: { id: restaurantId },
      totalAmount,
      deliveryAddress,
      status: OrderStatus.PENDING
    });

    // console.log('Order before save:', order);
    
    const savedOrder = await manager.save(order);
    
    // console.log('Saved order:', savedOrder);

    const orderItems: OrderItem[] = [];
    for (const itemData of orderItemsData) {
      const orderItem = manager.create(OrderItem, {
        order: { id: savedOrder.id },
        menuItem: { id: itemData.menuItem.id },
        quantity: itemData.quantity,
        price: itemData.price
      });
      
      const savedOrderItem = await manager.save(orderItem);
      orderItems.push(savedOrderItem);
    }

    return await manager.findOne(Order, {
      where: { id: savedOrder.id },
      relations: ['user', 'restaurant', 'items', 'items.menuItem']
    });
  });
}

  async checkout(orderId: number, user: User): Promise<Order> {
    return await this.dataSource.transaction(async manager => {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: ['user', 'items', 'items.menuItem', 'items.menuItem.restaurant']
      });

      if (!order) {
        throw new BadRequestException('Order not found');
      }

      if (user.role === UserRole.MEMBER) {
        throw new ForbiddenException('Members cannot checkout orders');
      }

      if (user.role !== UserRole.ADMIN) {
        const orderCountry = order.items[0]?.menuItem?.restaurant?.country;
        if (orderCountry !== user.country) {
          throw new ForbiddenException('Cannot checkout orders from other countries');
        }
      }

      if (order.status !== OrderStatus.CONFIRMED) {
        await manager.update(Order, { id: orderId }, { status: OrderStatus.CONFIRMED });
        order.status = OrderStatus.CONFIRMED;
      }

      return order;
    });
  }

  async cancel(orderId: number, user: User): Promise<Order> {
    return await this.dataSource.transaction(async manager => {
      const order = await manager.findOne(Order, {
        where: { id: orderId },
        relations: ['user', 'items', 'items.menuItem', 'items.menuItem.restaurant']
      });

      if (!order) {
        throw new BadRequestException('Order not found');
      }

      if (user.role === UserRole.MEMBER) {
        throw new ForbiddenException('Members cannot cancel orders');
      }

      if (user.role !== UserRole.ADMIN) {
        const orderCountry = order.items[0]?.menuItem?.restaurant?.country;
        if (orderCountry !== user.country) {
          throw new ForbiddenException('Cannot cancel orders from other countries');
        }
      }

      if (order.status !== OrderStatus.CANCELLED) {
        await manager.update(Order, { id: orderId }, { status: OrderStatus.CANCELLED });
        order.status = OrderStatus.CANCELLED;
      }

      return order;
    });
  }

  async findByUser(user: User): Promise<Order[]> {
    // First, let's debug what's happening
  //   console.log('Finding orders for user:', user.id, user.email);

  //   // Try a raw query first to see what's in the database
  //   const rawOrders = await this.orderRepository.query(`
  //   SELECT o.*, u.id as user_id, u.email as user_email, u.name as user_name 
  //   FROM "order" o 
  //   LEFT JOIN "user" u ON o."userId" = u.id 
  //   ORDER BY o."createdAt" DESC
  // `);

  //   console.log('Raw orders from database:', rawOrders);

    if (user.role === UserRole.ADMIN) {
      return await this.orderRepository.find({
        relations: {
          user: true,
          restaurant: true,
          items: {
            menuItem: true
          }
        },
        order: { createdAt: 'DESC' }
      });
    } else if (user.role === UserRole.MANAGER) {
      return await this.orderRepository.find({
        where: { user: { country: user.country}},
        relations: {
          user: true,
          restaurant: true,
          items: {
            menuItem: true
          }
        },
        order: { createdAt: 'DESC' }
      });
    } else {
      return await this.orderRepository.find({
        where: { user: { id: user.id } },
        relations: {
          user: true,
          restaurant: true,
          items: {
            menuItem: true
          }
        },
        order: { createdAt: 'DESC' }
      });
    }
  }
}