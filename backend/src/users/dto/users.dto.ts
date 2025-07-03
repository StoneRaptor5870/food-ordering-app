import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole, Country } from '../../common/enums';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be admin, manager, or member' })
  role?: UserRole;

  @IsEnum(Country, { message: 'Country must be india or america' })
  country: Country;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'Name cannot be empty' })
  name?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be admin, manager, or member' })
  role?: UserRole;

  @IsOptional()
  @IsEnum(Country, { message: 'Country must be india or america' })
  country?: Country;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'Current password is required' })
  currentPassword: string;

  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;
}