import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, Country } from '../common/enums';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const requireCountryAccess = this.reflector.getAllAndOverride<Country[]>('countryAccess', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!requiredRoles.some(role => role === user.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }

    // Country-based access control
    if (requireCountryAccess && user.role !== UserRole.ADMIN) {
      const request = context.switchToHttp().getRequest();
      const country = request.params.country || request.query.country;
      
      if (country && country !== user.country) {
        throw new ForbiddenException('Access denied: Country restriction');
      }
    }

    return true;
  }
}