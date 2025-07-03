import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole, Country } from '../common/enums';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { MenuItem } from '../restaurants/entities/menuItem.entity';
import * as bcrypt from 'bcryptjs';

export async function seedDatabase(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const restaurantRepository = dataSource.getRepository(Restaurant);
  const menuItemRepository = dataSource.getRepository(MenuItem);

  const users = [
    {
      email: 'nick.fury@shield.com',
      password: await bcrypt.hash('admin123', 10),
      name: 'Nick Fury',
      role: UserRole.ADMIN,
      country: Country.AMERICA,
      paymentMethod: 'Credit Card **** 1234',
    },
    {
      email: 'captain.marvel@shield.com',
      password: await bcrypt.hash('manager123', 10),
      name: 'Captain Marvel',
      role: UserRole.MANAGER,
      country: Country.INDIA,
    },
    {
      email: 'captain.america@shield.com',
      password: await bcrypt.hash('manager123', 10),
      name: 'Captain America',
      role: UserRole.MANAGER,
      country: Country.AMERICA,
    },
    {
      email: 'thanos@shield.com',
      password: await bcrypt.hash('member123', 10),
      name: 'Thanos',
      role: UserRole.MEMBER,
      country: Country.INDIA,
    },
    {
      email: 'thor@shield.com',
      password: await bcrypt.hash('member123', 10),
      name: 'Thor',
      role: UserRole.MEMBER,
      country: Country.INDIA,
    },
    {
      email: 'travis@shield.com',
      password: await bcrypt.hash('member123', 10),
      name: 'Travis',
      role: UserRole.MEMBER,
      country: Country.AMERICA,
    },
  ];

  for (const userData of users) {
    const existing = await userRepository.findOne({ where: { email: userData.email } });
    if (!existing) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
    }
  }

  const restaurants = [
    {
      name: 'Spice Palace',
      description: 'Authentic Indian cuisine with traditional spices',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
      country: Country.INDIA,
      rating: 4.5,
      address: '123 Delhi Road, Mumbai',
    },
    {
      name: 'Curry House',
      description: 'Modern Indian dining experience',
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
      country: Country.INDIA,
      rating: 4.2,
      address: '456 Bangalore Street, Pune',
    },
    {
      name: 'American Diner',
      description: 'Classic American comfort food',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
      country: Country.AMERICA,
      rating: 4.0,
      address: '789 Main Street, New York',
    },
    {
      name: 'Burger Junction',
      description: 'Gourmet burgers and fries',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
      country: Country.AMERICA,
      rating: 4.3,
      address: '321 Broadway, Los Angeles',
    },
  ];

  for (const restaurantData of restaurants) {
    const existing = await restaurantRepository.findOne({ where: { name: restaurantData.name } });
    if (!existing) {
      const restaurant = restaurantRepository.create(restaurantData);
      await restaurantRepository.save(restaurant);
    }
  }

  const menuItems = [
    { name: 'Butter Chicken', description: 'Creamy tomato-based curry with tender chicken', price: 12.99, image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400', category: 'Main Course', restaurantName: 'Spice Palace' },
    { name: 'Biryani', description: 'Fragrant basmati rice with spiced meat', price: 14.99, image: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=400', category: 'Main Course', restaurantName: 'Spice Palace' },
    { name: 'Naan Bread', description: 'Fresh baked Indian bread', price: 3.99, image: 'https://images.unsplash.com/photo-1619221582174-de3708e2ad1c?w=400', category: 'Sides', restaurantName: 'Spice Palace' },
    { name: 'Paneer Tikka', description: 'Grilled cottage cheese with spices', price: 11.99, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400', category: 'Appetizer', restaurantName: 'Curry House' },
    { name: 'Dal Makhani', description: 'Rich and creamy black lentil curry', price: 9.99, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400', category: 'Main Course', restaurantName: 'Curry House' },
    { name: 'Classic Burger', description: 'Beef patty with lettuce, tomato, and cheese', price: 13.99, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', category: 'Main Course', restaurantName: 'American Diner' },
    { name: 'French Fries', description: 'Crispy golden fries', price: 4.99, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400', category: 'Sides', restaurantName: 'American Diner' },
    { name: 'Milkshake', description: 'Creamy vanilla milkshake', price: 5.99, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400', category: 'Beverages', restaurantName: 'American Diner' },
    { name: 'BBQ Bacon Burger', description: 'Beef patty with BBQ sauce and crispy bacon', price: 15.99, image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433a?w=400', category: 'Main Course', restaurantName: 'Burger Junction' },
    { name: 'Chicken Wings', description: 'Spicy buffalo wings with ranch dip', price: 8.99, image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400', category: 'Appetizer', restaurantName: 'Burger Junction' },
  ];

  for (const item of menuItems) {
    const restaurant = await restaurantRepository.findOne({ where: { name: item.restaurantName } });
    if (restaurant) {
      const exists = await menuItemRepository.findOne({
        where: { name: item.name, restaurant: { id: restaurant.id } }
      });
      if (!exists) {
        const menuItem = menuItemRepository.create({ ...item, restaurant });
        await menuItemRepository.save(menuItem);
      }
    }
  }

  console.log('Database seeded successfully!');
}
