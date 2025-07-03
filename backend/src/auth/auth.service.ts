
import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/entities/user.entity';
import { UserRole, Country } from '../common/enums';
import { AuthResponse, LoginDto, SignupDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'name', 'role', 'country', 'paymentMethod'],
    });
    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async signup(signupDto: SignupDto): Promise<AuthResponse> {
    const { email, password, name, role = UserRole.MEMBER, country, paymentMethod } = signupDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    if (!name.trim()) {
      throw new BadRequestException('Name is required');
    }

    if (!Object.values(Country).includes(country)) {
      throw new BadRequestException('Invalid country specified');
    }

    if (role && !Object.values(UserRole).includes(role)) {
      throw new BadRequestException('Invalid role specified');
    }

    try {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const newUser = this.userRepository.create({
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        role,
        country,
        paymentMethod: paymentMethod?.trim() || undefined,
      });

      const savedUser = await this.userRepository.save(newUser);

      const payload = {
        email: savedUser.email,
        sub: savedUser.id,
        role: savedUser.role,
        country: savedUser.country,
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: savedUser.id,
          email: savedUser.email,
          name: savedUser.name,
          role: savedUser.role,
          country: savedUser.country,
          paymentMethod: savedUser.paymentMethod,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    const user = await this.validateUser(email.toLowerCase().trim(), password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      country: user.country,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        country: user.country,
        paymentMethod: user.paymentMethod,
      },
    };
  }

  async findById(id: number): Promise<User> {
    if (!id || id <= 0) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }
}