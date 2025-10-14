# BTAir Frontend

A modern, responsive airline booking system built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Customer Portal
- **Flight Search**: Advanced search with filters for location, date, passengers, class, and price
- **Flight Results**: Beautiful display of available flights with real-time data
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Interactive UI**: Modern interface with smooth animations and transitions

### Admin Panel
- **Dashboard**: System statistics and key performance indicators
- **Flight Management**: Create, edit, and manage flight schedules
- **Aircraft Management**: Manage aircraft fleet and availability
- **User Management**: Admin user controls and role management
- **Real-time Analytics**: Recent activities and revenue tracking

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: Sonner

## Prerequisites

Before you begin, ensure you have:
- Node.js (v18 or higher)
- npm or yarn package manager
- The BTAir backend API running (see backend README)

## Installation

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables** in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   NODE_ENV=development
   ```

## Development

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser** and navigate to `http://localhost:3000`

3. **API Connection**: Ensure the backend API is running on the configured URL

## Environment Variables

Create a `.env.local` file in the frontend directory with:

```env
# API Configuration - Update this to match your backend URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Development settings
NODE_ENV=development
```

## Demo Credentials

For testing purposes, use these demo credentials:

### Admin Account
- **Email**: admin@btair.com
- **Password**: password
- **Access**: Full admin panel access

### Customer Account
- **Email**: customer@btair.com
- **Password**: password
- **Access**: Customer booking features

## Project Structure

```
frontend/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── admin/          # Admin panel pages
│   │   ├── login/          # Authentication pages
│   │   ├── register/       
│   │   └── page.tsx        # Home page
│   ├── components/         # Reusable components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── Header.tsx     # Navigation header
│   │   ├── FlightSearch.tsx
│   │   └── FlightResults.tsx
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   ├── lib/               # Utilities and configurations
│   │   ├── api.ts         # API service layer
│   │   └── utils.ts       # Utility functions
│   └── types/             # TypeScript type definitions
│       └── index.ts
├── public/                # Static assets
├── tailwind.config.js     # Tailwind configuration
├── components.json        # shadcn/ui configuration
└── package.json
```

## Features Overview

### Flight Search
- **Smart Search**: Location-based search with autocomplete
- **Date Selection**: Interactive calendar picker
- **Advanced Filters**: Passenger count, seat class, and price range
- **Trip Types**: One-way and round-trip options

### Flight Results
- **Rich Display**: Comprehensive flight information
- **Price Comparison**: Clear pricing with class options
- **Seat Availability**: Real-time seat counts
- **Booking Integration**: Direct booking flow

### Authentication
- **Secure Login**: JWT-based authentication
- **User Registration**: Complete signup process
- **Role-based Access**: Customer and admin roles
- **Session Management**: Automatic token validation

### Admin Dashboard
- **Real-time Statistics**: Live system metrics
- **Fleet Management**: Aircraft status and utilization
- **Revenue Tracking**: Financial performance metrics
- **Activity Monitoring**: Recent system activities

## API Integration

The frontend communicates with the backend through a comprehensive API service layer:

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/validate-token` - Token validation

### Flight Endpoints
- `GET /flights` - Get all flights
- `POST /flights/search` - Search flights
- `GET /flights/{id}/seats` - Get flight seats

### Admin Endpoints
- `GET /admin/statistics` - System statistics
- `GET /admin/recent-activities` - Recent activities
- `GET /admin/aircraft` - Aircraft management

## Styling and UI

### Design System
- **Colors**: Blue primary theme with semantic colors
- **Typography**: Inter font family for modern look
- **Spacing**: Consistent spacing scale
- **Components**: Reusable shadcn/ui components

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: Tailwind's responsive breakpoints
- **Flexible Layouts**: CSS Grid and Flexbox
- **Touch Friendly**: Large touch targets

## Building for Production

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```

3. **Static Export** (optional):
   ```bash
   npm run export
   ```

## Deployment

### Vercel (Recommended)
1. Push code to GitHub repository
2. Connect to Vercel
3. Configure environment variables
4. Deploy automatically on push

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Troubleshooting

### Common Issues

1. **API Connection Failed**:
   - Check if backend is running
   - Verify API URL in environment variables
   - Check CORS configuration

2. **Build Errors**:
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify all dependencies are installed

3. **Authentication Issues**:
   - Clear browser localStorage
   - Check token expiration
   - Verify backend authentication endpoints

### Development Tips

- Use browser dev tools for debugging
- Check console for error messages
- Verify network requests in browser
- Use React Developer Tools extension

## License

This project is part of the BTAir airline reservation system.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the backend API documentation
3. Check browser console for errors
4. Verify environment configuration
