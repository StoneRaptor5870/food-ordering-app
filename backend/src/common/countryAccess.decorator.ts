import { SetMetadata } from '@nestjs/common';
import { UserRole, Country } from '../common/enums';

export const COUNTRY_ACCESS_KEY = 'countryAccess';
export const CountryAccess = (...countries: Country[]) => SetMetadata(COUNTRY_ACCESS_KEY, true);