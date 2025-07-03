import { Controller, Get, Query, UseGuards, Request, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/jwtAuth.guard';
import { RolesGuard } from 'src/common/roles.guard';
import { Roles } from 'src/common/roles.decorator';
import { CountryAccess } from 'src/common/countryAccess.decorator';
import { UserRole } from '../common/enums';
import { RestaurantsService } from './restaurants.service';

@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER)
  @CountryAccess()
  async getRestaurants(@Request() req, @Query('country') country?: string) {
    const userCountry = req.user.role === UserRole.ADMIN ? country : req.user.country;
    return this.restaurantsService.findByCountry(userCountry);
  }

  @Get(':id/menu')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER)
  async getMenu(@Request() req, @Param('id') restaurantId: number) {
    return this.restaurantsService.getMenuItems(restaurantId, req.user);
  }
}