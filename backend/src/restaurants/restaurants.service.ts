import { Injectable, ForbiddenException, BadRequestException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { MenuItem } from './entities/menuItem.entity';
import { User } from '../users/entities/user.entity';
import { UserRole, Country } from '../common/enums';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private menuItemsRepository: Repository<MenuItem>,
  ) {}

  async findByCountry(country?: string): Promise<Restaurant[]> {
    if (!country) {
      return this.restaurantRepository.find();
    }

    if (!Object.values(Country).includes(country as Country)) {
      throw new BadRequestException(`Invalid country: ${country}`);
    }

    return this.restaurantRepository.find({ where: { country: country as Country }});
  }

  async getMenuItems(restaurantId: number, user: User): Promise<MenuItem[]> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id: restaurantId }
    });

    if (!restaurant) {
      throw new Error('Restaurant not found');
    }

    // Check country access for non-admin users
    if (user.role !== UserRole.ADMIN && restaurant.country !== user.country) {
      throw new ForbiddenException('Access denied: Country restriction');
    }

    return this.menuItemsRepository.find({
      where: { restaurantId: restaurantId, available: true }
    });
  }
}