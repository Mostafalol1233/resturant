# Restaurant Management System

A modern, full-stack restaurant and retail management system with POS-style interface, built with React, Express, and PostgreSQL. Optimized for Vercel deployment.

## Features

### Core Functionality
- **Dashboard Analytics** - Real-time sales metrics, revenue tracking, and performance insights
- **Order Management** - Complete POS system with order creation, tracking, and status updates
- **Product Management** - Inventory tracking, category management, and product catalog
- **Inventory Control** - Stock monitoring, low-stock alerts, and inventory transactions
- **Reporting** - Sales reports, top products analysis, and business analytics

### Technical Features
- **Real-time Updates** - Live order status changes and inventory updates
- **Responsive Design** - Mobile-friendly interface for tablets and smartphones
- **Authentication** - Secure user authentication with session management
- **Database Integration** - PostgreSQL with Drizzle ORM for data persistence
- **Modern UI** - Clean, professional interface built with Tailwind CSS and Radix UI

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI, TanStack Query
- **Backend**: Express.js, Node.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Express Session with Passport.js
- **Deployment**: Vercel (configured for serverless functions)
- **Build Tools**: Vite, ESBuild

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (local or cloud)
- npm or yarn package manager

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd restaurant-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env` file with your database configuration:
```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=development
```

4. **Database Setup**
```bash
# Push schema to database
npm run db:push
```

5. **Start Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Deployment to Vercel

### Prerequisites
- Vercel account
- PostgreSQL database (recommend Neon, Supabase, or Railway)

### Deployment Steps

1. **Connect Repository to Vercel**
   - Import your repository to Vercel
   - Configure build settings (automatic with vercel.json)

2. **Environment Variables**
   Set the following environment variables in Vercel dashboard:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NODE_ENV=production
   ```

3. **Deploy**
   - Vercel will automatically build and deploy
   - The build process runs: `npm run build`
   - Serverless functions handle API routes

### Database Configuration

For production deployment, ensure your PostgreSQL database:
- Allows connections from Vercel's IP ranges
- Has SSL enabled (most cloud providers do this by default)
- Connection string format: `postgresql://user:password@host:port/database?sslmode=require`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
├── server/                 # Backend Express application
│   ├── routes.ts           # API route definitions
│   ├── auth.ts             # Authentication logic
│   ├── storage.ts          # Database operations
│   └── db.ts               # Database connection
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Drizzle database schema
├── vercel.json             # Vercel deployment configuration
└── package.json            # Project dependencies
```

## API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/auth/user` - Get current user

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/recent-orders` - Recent orders
- `GET /api/dashboard/top-products` - Top selling products

### Orders
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

### Products
- `GET /api/products` - List all products
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/low-stock` - Low stock products

### Categories
- `GET /api/categories` - List all categories
- `POST /api/categories` - Create new category

## Database Schema

The system uses PostgreSQL with the following main tables:
- `users` - User accounts and authentication
- `restaurants` - Restaurant configuration
- `categories` - Product categories
- `products` - Menu items and inventory
- `orders` - Customer orders
- `order_items` - Individual order line items
- `inventory_transactions` - Stock movement tracking
- `notifications` - System notifications

## Configuration

### Vercel Configuration (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "dist/client" }
    }
  ],
  "functions": {
    "server/index.ts": {
      "runtime": "@vercel/node",
      "maxDuration": 30
    }
  },
  "routes": [
    { "src": "/api/(.*)", "dest": "server/index.ts" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run check

# Database schema push
npm run db:push
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review the API documentation above

---

**Note**: This system includes sample data for demonstration purposes. In production, ensure to remove demo users and configure proper authentication.