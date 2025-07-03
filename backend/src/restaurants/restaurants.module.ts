import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { Restaurant } from './entities/restaurant.entity';
import { MenuItem } from './entities/menuItem.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Restaurant, MenuItem])
  ],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
  exports: [RestaurantsService, TypeOrmModule],
})
export class RestaurantsModule {}