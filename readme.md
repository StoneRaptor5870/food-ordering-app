# FoodieHub - Complete Food Ordering Platform

A comprehensive full-stack food ordering platform featuring role-based access control, multi-country support, and real-time order management. Built with Next.js frontend and NestJS backend.

## 🚀 Features

### Core Features
- **Role-Based Access Control**: Admin, Manager, and Member roles with different permissions
- **Multi-Country Support**: Restaurants from India and America with country-based restrictions
- **Real-Time Cart Management**: Add, remove, and update items across multiple restaurants
- **Restaurant Discovery**: Search and filter restaurants by country and name
- **Order Management**: Complete order lifecycle from creation to delivery
- **Payment Integration**: Secure payment processing with multiple payment methods
- **Authentication & Authorization**: JWT-based authentication with secure token management

### Backend Features
- **RESTful API**: Comprehensive API endpoints for all operations
- **Database Management**: PostgreSQL with TypeORM for robust data persistence
- **User Management**: Complete user lifecycle with profile management
- **Restaurant Management**: Full restaurant and menu item management
- **Order Processing**: Advanced order status tracking and management
- **Payment Processing**: Secure payment method management
- **Security**: Password hashing, JWT authentication, and role-based access

### Frontend Features
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Real-Time Updates**: Live cart and order status updates
- **Interactive UI**: Modern, user-friendly interface with animations
- **Progressive Web App**: Optimized for mobile devices
- **State Management**: Context API for global state management

## 🏗️ Architecture Overview

### Full-Stack Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  Landing Page   │  │   Dashboard     │  │   Auth      │  │
│  │     React       │  │    React        │  │   Pages     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│            │                   │                   │        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │ 
│  │  Cart Provider  │  │ Auth Provider   │  │ Components  │  │
│  │  Context API    │  │  Context API    │  │  Shadcn/ui  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                         HTTP/REST API
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Backend (NestJS)                         │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  Auth Module    │  │  Users Module   │  │ Restaurant  │  │
│  │  JWT Strategy   │  │  CRUD Ops       │  │   Module    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│            │                   │                   │        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │  Orders Module  │  │ Payment Module  │  │ Guards &    │  │
│  │  Status Track   │  │  Method Mgmt    │  │ Decorators  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                         TypeORM
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │     Users       │  │   Restaurants   │  │   Orders    │  │
│  │     Table       │  │     Table       │  │    Table    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│            │                   │                   │        │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │   MenuItems     │  │   OrderItems    │  │   Foreign   │  │ 
│  │     Table       │  │     Table       │  │     Keys    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack

#### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **State Management**: React Context API
- **Authentication**: JWT tokens with localStorage

#### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Validation**: Class Validator & Class Transformer
- **Password Hashing**: bcryptjs
- **Environment**: dotenv

#### Database Schema
```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'manager', 'member')),
    country VARCHAR(50) CHECK (country IN ('india', 'america')),
    paymentMethod VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Restaurants Table
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    image VARCHAR(255),
    country VARCHAR(50) CHECK (country IN ('india', 'america')),
    rating DECIMAL(3,2) DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- MenuItems Table
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    category VARCHAR(255),
    available BOOLEAN DEFAULT true,
    restaurantId INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    userId INTEGER REFERENCES users(id) ON DELETE CASCADE,
    restaurantId INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
    totalAmount DECIMAL(10,2) NOT NULL,
    deliveryAddress TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled')),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OrderItems Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    orderId INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    menuItemId INTEGER REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(10,2) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18.0 or higher
- PostgreSQL database
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone <repository-url>
cd directory
```

### 2. Backend Setup

#### Install Backend Dependencies
```bash
cd backend
npm install
```

#### Backend Environment Configuration
Create a `.env` file in the backend directory:
```env
# Database Configuration
DATABASE_URL=url

OR


DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=food_delivery_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Application Configuration
NODE_ENV=development
PORT=3001
```

#### Database Setup
```bash
# Create PostgreSQL database
createdb food_delivery_db

# Run database migrations (TypeORM will auto-create tables)
npm run start:dev
```

### 3. Frontend Setup

#### Install Frontend Dependencies
```bash
cd frontend
npm install
```

#### Frontend Environment Configuration
Create a `.env.local` file in the frontend directory:
```env
NEXT_PUBLIC_BASE_URL=http://localhost:3001
```

### 4. Running the Application

#### Start Backend Server
```bash
cd backend
npm run start:dev
```
Backend will run on `http://localhost:3001`

#### Start Frontend Server
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:3000`

## 🔐 User Roles & Permissions

### Admin
- **Full Access**: Can access all restaurants across all countries
- **User Management**: Can view and manage all users
- **Order Management**: Can place, checkout, and cancel orders
- **Payment Processing**: Can update payment methods for all users
- **Global Access**: No country restrictions

### Manager
- **Country-Specific Access**: Can only access restaurants in their assigned country
- **Order Management**: Can place orders and process payments
- **Team Management**: Can manage orders within their country
- **Limited User Access**: Can view users within their country

### Member
- **Basic Access**: Can view restaurants in their country
- **Order Creation**: Can create orders but requires manager/admin approval for payment
- **Limited Management**: Can only view their own orders
- **Country Restricted**: Access limited to their assigned country

## 📚 API Documentation

### Base URL
```
http://localhost:3001
```

### Authentication Endpoints

#### Register User
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "member",
  "country": "india",
  "paymentMethod": "Credit Card"
}

Response:
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "member",
      "country": "india"
    }
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "member",
      "country": "india"
    }
  }
}
```

#### Verify Token
```http
POST /auth/verify-token
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "member",
      "country": "india"
    }
  }
}
```

### User Management Endpoints

#### Get User Profile
```http
GET /users/profile
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "member",
    "country": "india",
    "paymentMethod": "Credit Card"
  }
}
```

#### Get All Users (Admin/Manager only)
```http
GET /users?page=1&limit=10&role=member&country=india
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "email": "user@example.com",
        "name": "John Doe",
        "role": "member",
        "country": "india"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

#### Update Profile
```http
PATCH /users/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "Updated Name",
  "paymentMethod": "PayPal"
}

Response:
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "Updated Name",
    "paymentMethod": "PayPal"
  }
}
```

### Restaurant Endpoints

#### Get Restaurants
```http
GET /restaurants?country=india
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Spice Palace",
      "description": "Authentic Indian cuisine",
      "address": "123 Main St, Mumbai",
      "image": "restaurant-image.jpg",
      "country": "india",
      "rating": 4.5
    }
  ]
}
```

#### Get Restaurant Menu
```http
GET /restaurants/:id/menu
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "data": {
    "restaurant": {
      "id": 1,
      "name": "Spice Palace",
      "description": "Authentic Indian cuisine"
    },
    "menuItems": [
      {
        "id": 1,
        "name": "Chicken Biryani",
        "description": "Aromatic rice dish with spiced chicken",
        "price": 299.99,
        "image": "biryani.jpg",
        "category": "Main Course",
        "available": true
      }
    ]
  }
}
```

### Order Management Endpoints

#### Create Order
```http
POST /orders
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "restaurantId": 1,
  "deliveryAddress": "123 Main St, City",
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2
    },
    {
      "menuItemId": 2,
      "quantity": 1
    }
  ]
}

Response:
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "userId": 1,
    "restaurantId": 1,
    "totalAmount": 599.98,
    "deliveryAddress": "123 Main St, City",
    "status": "pending",
    "items": [
      {
        "menuItemId": 1,
        "quantity": 2,
        "price": 299.99
      }
    ]
  }
}
```

#### Get User Orders
```http
GET /orders
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "totalAmount": 599.98,
      "deliveryAddress": "123 Main St, City",
      "status": "pending",
      "createdAt": "2025-01-01T10:00:00Z",
      "restaurant": {
        "id": 1,
        "name": "Spice Palace"
      },
      "items": [
        {
          "menuItem": {
            "name": "Chicken Biryani",
            "price": 299.99
          },
          "quantity": 2
        }
      ]
    }
  ]
}
```

#### Checkout Order (Manager/Admin only)
```http
POST /orders/:id/checkout
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "message": "Order payment processed successfully",
  "data": {
    "id": 1,
    "status": "confirmed",
    "totalAmount": 599.98,
    "paymentStatus": "completed"
  }
}
```

#### Cancel Order (Manager/Admin only)
```http
DELETE /orders/:id
Authorization: Bearer <jwt-token>

Response:
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

### Payment Endpoints

#### Update Payment Method (Admin only)
```http
PUT /payments/paymentMethod
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "paymentMethod": "Credit Card"
}

Response:
{
  "success": true,
  "message": "Payment method updated successfully",
  "data": {
    "paymentMethod": "Credit Card"
  }
}
```

## 🎨 Frontend Components

### Component Architecture
```
components/
├── authProvider.tsx          # Authentication context provider
├── cartProvider.tsx          # Shopping cart state management
├── cartModal.tsx            # Cart interface and checkout
├── restaurantList.tsx       # Restaurant listing with filters
├── restaurantsMenuModal.tsx # Restaurant menu display
├── orderHistory.tsx         # Order history and management
└── landingPage.tsx          # Landing page with hero section
```

### Key Features

#### Cart Management
- **Multi-restaurant support**: Add items from different restaurants
- **Real-time updates**: Instant quantity changes and total calculations
- **Persistent state**: Cart survives page refreshes
- **Order grouping**: Orders organized by restaurant

#### Restaurant Discovery
- **Search functionality**: Find restaurants by name
- **Country filtering**: Filter by user's country or all (admin)
- **Responsive grid**: Mobile-optimized restaurant cards
- **Rating display**: Visual rating system

#### Order Processing
- **Status tracking**: Real-time order status updates
- **Order history**: Complete order records with details
- **Payment integration**: Secure payment processing
- **Role-based actions**: Different capabilities per user role

## 🔧 Development Scripts

### Backend Scripts
```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start in debug mode

# Production
npm run build             # Build application
npm run start:prod        # Start in production mode

# Testing
npm run test             # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:cov         # Run tests with coverage
npm run test:e2e         # Run end-to-end tests

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

### Frontend Scripts
```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run end-to-end tests
```

## 🌍 Multi-Country Support

### Supported Countries
- **India** (`india`)
- **America** (`america`)

### Country-Based Features
- **Restaurant Filtering**: Users see restaurants from their country
- **Access Control**: Country-specific data access
- **Admin Override**: Admins can access all countries
- **Order Restrictions**: Orders limited to user's country

## 📊 Order Status Flow

```
PENDING → CONFIRMED → PREPARING → DELIVERED
   ↓
CANCELLED (can be cancelled at any time by Manager/Admin)
```

### Status Descriptions
- **Pending**: Order created, waiting for confirmation
- **Confirmed**: Restaurant accepted the order
- **Preparing**: Order is being prepared
- **Delivered**: Order completed successfully
- **Cancelled**: Order cancelled by user or system

## 🛡️ Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Different permissions per user role
- **Password Security**: bcryptjs hashing with salt rounds
- **Token Validation**: Automatic token verification

### Data Protection
- **Input Validation**: Server-side validation using class-validator
- **SQL Injection Protection**: TypeORM query builder
- **XSS Prevention**: Input sanitization
- **CORS Configuration**: Proper cross-origin resource sharing

### Frontend Security
- **Secure Storage**: JWT tokens in localStorage with expiration
- **Route Protection**: Role-based route access
- **API Security**: Authorization headers on all requests
- **Form Validation**: Client-side and server-side validation

## 🚀 Deployment

### Backend Deployment

#### Environment Variables
```env
# Production Backend
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PORT=5432
DB_USERNAME=your-production-db-username
DB_PASSWORD=your-production-db-password
DB_NAME=your-production-db-name
JWT_SECRET=your-super-secure-production-jwt-secret
PORT=3001
```

#### Docker Setup
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "start:prod"]
```

### Frontend Deployment

#### Environment Variables
```env
# Production Frontend
NEXT_PUBLIC_BASE_URL=https://your-api-domain.com
```

#### Build Commands
```bash
# Build for production
npm run build

# Deploy to Vercel
npx vercel

# Deploy to Netlify
npm run build && netlify deploy --prod --dir=out
```

## 📈 Performance Optimization

### Backend Optimization
- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Redis integration for frequently accessed data
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Efficient TypeORM queries

### Frontend Optimization
- **Code Splitting**: Route-based code splitting
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Components and routes
- **Bundle Analysis**: Webpack bundle optimization

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
- **Database Connection**: Check PostgreSQL service and credentials
- **JWT Errors**: Verify JWT_SECRET configuration
- **Port Conflicts**: Ensure port 3001 is available

#### Frontend Issues
- **API Connection**: Verify NEXT_PUBLIC_BASE_URL
- **Authentication**: Clear localStorage and re-login
- **Cart Issues**: Refresh page to reset state

#### Integration Issues
- **CORS Errors**: Check backend CORS configuration
- **Token Expiration**: Implement token refresh mechanism
- **Data Sync**: Ensure frontend and backend data models match

**Note**: This is a full-stack application. Make sure to run both backend and frontend servers for complete functionality. The backend API serves as the data layer, while the frontend provides the user interface.