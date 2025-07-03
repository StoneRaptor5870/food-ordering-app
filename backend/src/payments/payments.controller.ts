import { Controller, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/jwtAuth.guard';
import { RolesGuard } from 'src/common/roles.guard';
import { Roles } from 'src/common/roles.decorator';
import { UserRole } from '../common/enums';
import { UpdatePaymentMethodDto } from './dto/updatePaymentMethod.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentController {
  constructor(private paymentsService: PaymentsService) {}

  @Put('paymentMethod')
  @Roles(UserRole.ADMIN)
  async updatePaymentMethod(@Request() req, @Body() updatePaymentMethodDto: UpdatePaymentMethodDto) {
    return this.paymentsService.updatePaymentMethod(req.user.id, updatePaymentMethodDto);
  }
}