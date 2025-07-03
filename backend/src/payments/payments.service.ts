import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from "../users/entities/user.entity";
import { UpdatePaymentMethodDto } from "./dto/updatePaymentMethod.dto";

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async updatePaymentMethod(userId: number, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    const user = await this.userRepository.findOne({ where: {id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    user.paymentMethod = updatePaymentMethodDto.paymentMethod;
    return this.userRepository.save(user);
  }
}