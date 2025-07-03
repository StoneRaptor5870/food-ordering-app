import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException,
  UnauthorizedException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User,} from './entities/user.entity';
import { UserRole, Country } from '../common/enums';
import { CreateUserDto, ChangePasswordDto, UpdateUserDto } from './dto/users.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, name, role = UserRole.MEMBER, country, paymentMethod } = createUserDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
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

      const { password: _, ...userWithoutPassword } = savedUser;
      return userWithoutPassword as User;
    } catch (error) {
      throw new BadRequestException('Failed to create user');
    }
  }

  async findAll(
    page: number = 1, 
    limit: number = 10, 
    role?: UserRole, 
    country?: Country
  ): Promise<{ users: User[], total: number, page: number, limit: number }> {
    const query = this.userRepository.createQueryBuilder('user')
      .select([
        'user.id',
        'user.email', 
        'user.name', 
        'user.role', 
        'user.country', 
        'user.paymentMethod'
      ]);

    if (role) {
      query.andWhere('user.role = :role', { role });
    }

    if (country) {
      query.andWhere('user.country = :country', { country });
    }

    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);

    query.orderBy('user.id', 'DESC');

    const [users, total] = await query.getManyAndCount();

    return {
      users,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<User> {
    if (!id || id <= 0) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'name', 'role', 'country', 'paymentMethod'], // Exclude password
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.userRepository.findOne({ 
      where: { email: email.toLowerCase().trim() },
      select: ['id', 'email', 'name', 'role', 'country', 'paymentMethod'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmailWithPassword(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ 
      where: { email: email.toLowerCase().trim() } 
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    Object.keys(updateUserDto).forEach(key => {
      if (updateUserDto[key] !== undefined) {
        if (key === 'name' || key === 'paymentMethod') {
          user[key] = updateUserDto[key]?.trim();
        } else {
          user[key] = updateUserDto[key];
        }
      }
    });

    try {
      const updatedUser = await this.userRepository.save(user);
      return updatedUser;
    } catch (error) {
      throw new BadRequestException('Failed to update user');
    }
  }

  async changePassword(id: number, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    await this.userRepository.update(id, { password: hashedNewPassword });
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);

    try {
      await this.userRepository.delete(id);
    } catch (error) {
      throw new BadRequestException('Failed to delete user');
    }
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    usersByRole: { role: UserRole; count: number }[];
    usersByCountry: { country: Country; count: number }[];
  }> {
    const totalUsers = await this.userRepository.count();

    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const usersByCountry = await this.userRepository
      .createQueryBuilder('user')
      .select('user.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.country')
      .getRawMany();

    return {
      totalUsers,
      usersByRole: usersByRole.map(item => ({
        role: item.role,
        count: parseInt(item.count),
      })),
      usersByCountry: usersByCountry.map(item => ({
        country: item.country,
        count: parseInt(item.count),
      })),
    };
  }

  async updateRole(id: number, newRole: UserRole): Promise<User> {
    const user = await this.findOne(id);
    
    user.role = newRole;
    
    try {
      const updatedUser = await this.userRepository.save(user);
      return updatedUser;
    } catch (error) {
      throw new BadRequestException('Failed to update user role');
    }
  }

  async searchUsers(searchTerm: string, page: number = 1, limit: number = 10): Promise<{
    users: User[];
    total: number;
    page: number;
    limit: number;
  }> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      throw new BadRequestException('Search term is required');
    }

    const query = this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.email',
        'user.name',
        'user.role',
        'user.country',
        'user.paymentMethod'
      ])
      .where('user.name ILIKE :searchTerm', { searchTerm: `%${searchTerm.trim()}%` })
      .orWhere('user.email ILIKE :searchTerm', { searchTerm: `%${searchTerm.trim()}%` });

    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);
    query.orderBy('user.name', 'ASC');

    const [users, total] = await query.getManyAndCount();

    return {
      users,
      total,
      page,
      limit,
    };
  }
}