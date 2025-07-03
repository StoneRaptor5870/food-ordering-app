import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/jwtAuth.guard';
import { RolesGuard } from 'src/common/roles.guard';
import { Roles } from 'src/common/roles.decorator';
import { CountryAccess } from 'src/common/countryAccess.decorator';
import { UserRole } from '../common/enums';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/createOrder.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER)
  async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto, req.user);
  }

  @Post(':id/checkout')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async checkout(@Param('id') id: number, @Request() req) {
    return this.ordersService.checkout(id, req.user);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @CountryAccess()
  async cancelOrder(@Param('id') id: number, @Request() req) {
    return this.ordersService.cancel(id, req.user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.MEMBER)
  @CountryAccess()
  async getOrders(@Request() req) {
    return this.ordersService.findByUser(req.user);
  }
}