import { UserRole, Country } from '../../common/enums';

export interface SignupDto {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
  country: Country;
  paymentMethod?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    country: Country;
    paymentMethod?: string;
  };
}