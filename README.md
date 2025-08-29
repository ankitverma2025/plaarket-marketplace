# Plaarket Marketplace

A modular marketplace platform for organic products supporting both B2B and B2C transactions.

## Features

- **Multi-role Support**: Buyers, Sellers, and Admins
- **B2C Shopping**: Traditional e-commerce cart and checkout
- **B2B RFQ System**: Request for Quote functionality for bulk purchases
- **Product Catalog**: Advanced search and filtering
- **Certification Management**: Upload and verify organic certifications
- **Order Management**: Complete order lifecycle tracking
- **Modular Architecture**: Each feature is independently extensible

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd plaarket-marketplace
   npm run install:all
   ```

2. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Database Setup**
   ```bash
   cd backend
   npm run db:migrate
   npm run db:seed
   ```

4. **Start Development**
   ```bash
   npm run dev
   ```

   - Backend: http://localhost:5000
   - Frontend: http://localhost:3000

## Project Structure

```
plaarket-marketplace/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── modules/        # Modular feature organization
│   │   │   ├── auth/       # Authentication & authorization
│   │   │   ├── users/      # User management
│   │   │   ├── products/   # Product catalog
│   │   │   ├── orders/     # Order management
│   │   │   ├── rfq/        # Request for Quote
│   │   │   ├── certifications/ # Certification system
│   │   │   └── notifications/  # Notification system
│   │   ├── shared/         # Shared utilities
│   │   └── config/         # Configuration
│   └── package.json
├── frontend/               # React/Next.js application
│   ├── src/
│   │   ├── modules/        # Feature-based modules
│   │   ├── shared/         # Shared components
│   │   └── styles/         # Global styles and theme
│   └── package.json
└── package.json           # Root package for workspace
```

## Technology Stack

### Backend
- **Framework**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with role-based access
- **File Upload**: Multer with local/cloud storage
- **Cache**: Redis for session management
- **Validation**: Joi for request validation

### Frontend
- **Framework**: Next.js (React)
- **Styling**: Tailwind CSS with custom theme
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **UI Components**: Headless UI + custom components

## Development Modes

- **Development**: `npm run dev` - Hot reload for both frontend and backend
- **Staging**: Environment variable based configuration  
- **Production**: Optimized builds with environment-specific settings

## Deployment

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy with automatic CI/CD

### Environment Variables
See `env.example` for all required configuration options.

## Module Architecture

Each feature is organized as an independent module with:
- **Models**: Database schemas
- **Controllers**: Business logic
- **Routes**: API endpoints  
- **Services**: External integrations
- **Middleware**: Feature-specific middleware

This allows for easy extension and modification of individual features without affecting others.

## Contributing

1. Follow the modular architecture
2. Add tests for new features
3. Update documentation
4. Ensure environment compatibility

## License

MIT License - see LICENSE file for details
