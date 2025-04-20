# Disc: Music Discovery Platform

Disc is a dynamic web-based music discovery platform that combines advanced recommendation technologies with an engaging user experience to help users discover new music, track their listening habits, and connect with the local music scene.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Contributing](#contributing)

## Features

- **User Authentication**: Register, login, and remember me functionality
- **Music Discovery**: AI-powered music recommendations based on user preferences
- **Album Reviews**: Rate and review albums you've listened to
- **Event Discovery**: Find music events near your location
- **Personalized Dashboard**: Track your listening history and preferences

## Tech Stack

- **Frontend**: React with TypeScript, TailwindCSS, Shadcn UI
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based authentication
- **Build System**: Vite
- **AI Integration**: OpenAI for music recommendations

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16 or higher)
- PostgreSQL database
- An OpenAI API key (for AI-powered recommendations)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/disc.git
cd disc
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

#### On Replit
If you're using Replit, the PostgreSQL database is already set up for you, and the `DATABASE_URL` environment variable is automatically configured. 

For the OpenAI API key, you'll need to add it to your Replit Secrets:
1. Click on the "Tools" tab in the left sidebar
2. Select "Secrets"
3. Add a new secret with the key `OPENAI_API_KEY` and your API key as the value

#### Locally
If you're running the application locally, create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/disc
OPENAI_API_KEY=your_openai_api_key
```

### 4. Set up the database

#### On Replit
The database schema is configured to automatically apply when the application starts. You can manually trigger a database schema update with:

```bash
npm run db:push
```

#### Locally
If you're running locally, you need to set up your PostgreSQL database first, then push the schema:

```bash
# Create a PostgreSQL database
createdb disc

# Push the schema to your database
npm run db:push
```

## Running the Application

### On Replit

To run the application directly in Replit:

1. Click the "Run" button at the top of the Replit interface.
2. Wait for the workflow "Start application" to initialize (this may take a few moments).
3. Once running, click the "Webview" tab to view the application (or navigate to your Replit URL).

The application is configured to automatically restart when you make changes to the code.

### Development Mode Locally

If you want to run the application on your local machine:

1. Clone the repository from Replit
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

This will start both the Express backend and the Vite development server for the frontend. The application will be available at http://localhost:5000.

The development server supports hot module replacement (HMR), so changes to the code will automatically update in the browser.

### Production Mode

To build and run the application for production:

```bash
# Build the application
npm run build

# Start the production server
npm run start
```

The production build will be optimized for performance and will not include development tools like the Vite dev server.

### Replit Deployments

To deploy your application from Replit:

1. Make sure your application is running and working as expected
2. Click on the "Deploy" button in the Replit interface
3. Follow the deployment instructions provided by Replit

## Testing

### Testing the Application

You can test the Disc application using the following steps:

### 1. Initial Setup

Before testing, make sure you have:
- Set up the database properly
- Started the application (either via the Replit "Run" button or locally)
- Created a test user account

### 2. Testing the Remember Me Feature

1. Navigate to the login page at `/auth` in the Replit webview (or http://localhost:5000/auth if running locally)
2. Enter your credentials
3. Check the "Remember Me" checkbox
4. Login
5. Close your browser and reopen it
6. Visit the application again - you should still be logged in without having to re-enter your credentials

### 3. Testing User Authentication

1. Try to register a new account with a username that already exists
2. Try to register a new account with valid information
3. Try to log in with incorrect credentials
4. Try to log in with correct credentials
5. Try to access protected routes when not logged in

### 4. Testing Music Recommendations

1. Login to your account
2. Navigate to the Discover page
3. Browse through the AI-generated recommendations
4. Click on an album to see details and add your ratings

### 5. Testing Database Functionality

1. Create a new review for an album
2. Check that the review appears in the appropriate place
3. Try to search for albums using different search terms
4. Verify that artist and album relationships work correctly

### 6. Testing Event Discovery

1. Navigate to the Events page
2. Enter your location or allow the browser to detect your location
3. Browse through upcoming music events in your area

### 7. Testing Responsive Design

1. Resize your browser window to test responsive layouts
2. Test the application on different devices if possible (mobile, tablet, desktop)
3. Check that all UI components adapt correctly to different screen sizes

## Project Structure

```
disc/
├── client/             # Frontend React application
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── hooks/      # Custom React hooks
│   │   ├── lib/        # Utility functions
│   │   ├── pages/      # Page components
│   │   └── App.tsx     # Main application component
├── server/             # Backend Express application
│   ├── auth.ts         # Authentication logic
│   ├── routes.ts       # API routes
│   ├── storage.ts      # Database access layer
│   └── index.ts        # Server entry point
├── shared/             # Shared code between frontend and backend
│   └── schema.ts       # Database schema and types
└── package.json        # Project dependencies
```

## Database Schema

The application uses the following database tables:

- **users**: User accounts and credentials
- **artists**: Music artists
- **albums**: Music albums with artist references
- **reviews**: User reviews of albums
- **events**: Music events with location data

## API Endpoints

### Authentication

- `POST /api/register`: Register a new user
- `POST /api/login`: Log in a user (with optional Remember Me)
- `POST /api/logout`: Log out the current user
- `GET /api/user`: Get the current authenticated user

### Music Data

- `GET /api/albums`: Get all albums
- `GET /api/albums/search`: Search for albums
- `GET /api/albums/:id`: Get album details
- `GET /api/artists`: Get all artists
- `GET /api/artists/:id`: Get artist details

### Reviews

- `GET /api/reviews`: Get all reviews
- `POST /api/reviews`: Create a new review

### Events

- `GET /api/events`: Get music events by location
- `POST /api/events`: Create a new event

## Troubleshooting

### Common Issues and Solutions

#### Application Not Starting

**Issue**: The application fails to start or shows errors during startup.
**Solution**: 
1. Check that all required dependencies are installed (`npm install`)
2. Ensure the database is properly configured
3. Verify that all environment variables are set correctly
4. Check the console logs for specific error messages

#### Database Connection Issues

**Issue**: The application cannot connect to the database.
**Solution**:
1. In Replit, verify that the PostgreSQL database is running (check the "Tools" tab)
2. Ensure the `DATABASE_URL` environment variable is set correctly
3. Try running a manual database migration with `npm run db:push`

#### Authentication Problems

**Issue**: Unable to register or login.
**Solution**:
1. Verify that the session storage is properly configured
2. Check for any validation errors in the registration form
3. Ensure that passwords are being properly hashed and stored
4. Check the network requests in your browser's developer tools for specific error responses

#### Remember Me Not Working

**Issue**: The "Remember Me" functionality isn't persisting the session after browser restart.
**Solution**:
1. Verify that cookies are not being blocked by your browser
2. Check that the session cookie configuration includes proper `maxAge` settings
3. Ensure the `rememberMe` parameter is being correctly passed from the login form to the API

#### API Endpoint Errors

**Issue**: API endpoints are returning errors or not functioning as expected.
**Solution**:
1. Check that the API route is correctly defined in the `routes.ts` file
2. Verify that the request payload matches the expected format
3. Look for validation errors in the request processing
4. Check the server logs for specific error messages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request