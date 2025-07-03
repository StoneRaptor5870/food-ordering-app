import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  ValidationPipe,
  BadRequestException,
  ConflictException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignupDto, LoginDto, AuthResponse } from './dto/auth.dto';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { UserRole, Country } from '../common/enums';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    try {
      const result = await this.authService.login(loginDto);
      return {
        success: true,
        message: 'Login successful',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body(ValidationPipe) signupDto: SignupDto) {
    try {
      const result = await this.authService.signup(signupDto);
      return {
        success: true,
        message: 'User registered successfully',
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  // @UseGuards(AuthGuard('jwt'))
  // @Get('profile')
  // async getProfile(@Request() req) {
  //   try {
  //     const user = await this.authService.findById(req.user.sub);
  //     const { password, ...userProfile } = user;
  //     return {
  //       success: true,
  //       message: 'Profile retrieved successfully',
  //       data: userProfile,
  //     };
  //   } catch (error) {
  //     return {
  //       success: false,
  //       message: error.message,
  //     };
  //   }
  // }

  @UseGuards(AuthGuard('jwt'))
  @Post('verify-token')
  @HttpCode(HttpStatus.OK)
  async verifyToken(@Request() req) {
    return {
      success: true,
      message: 'Token is valid',
      data: {
        userId: req.user.sub,
        email: req.user.email,
        role: req.user.role,
        country: req.user.country,
      },
    };
  }
}