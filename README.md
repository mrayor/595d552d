# Notes API

A RESTful API for managing notes with search and sharing features.

## Technology Choices

### Core Framework: Express.js with TypeScript

I chose Express.js because it is a lightweight and flexible framework that is easy to set up and configure. It also has a large ecosystem of middleware and great TypeScript support.

### Database: MongoDB

I chose MongoDB because it is a NoSQL database that is schema flexible and has built-in text search capabilities. It is also easy to scale and has great performance for read-heavy operations.

### Key Third-Party Tools

1. **@typegoose/typegoose**
   Typegoose is a library that provides TypeScript decorators for MongoDB models. It is a great alternative to Mongoose and has a smaller bundle size.

2. **zod**
   Zod is a schema declaration and validation library for TypeScript. It is a great alternative to Joi and has a smaller bundle size.

3. **jsonwebtoken**
   Jsonwebtoken is a library that provides a JSON Web Token implementation for Node.js. It is a great alternative to JWT and has a smaller bundle size.

## Setup Instructions

### Prerequisites

- Node.js (v18+)
- MongoDB (v4.4+)
- Redis
- OpenSSL (for key generation)
- npm or yarn

### Local Development Setup

1. **Clone the Repository**

```bash
git clone https://github.com/mrayor/595d552d.git
cd 595d552d
```

2. **Install Dependencies**

```bash
npm install
```

3. **Generate JWT Keys**

```bash
openssl genrsa -out access_private.pem 2048
openssl rsa -in access_private.pem -pubout -out access_public.pem
openssl genrsa -out refresh_private.pem 2048
openssl rsa -in refresh_private.pem -pubout -out refresh_public.pem
```

4. **Environment Configuration**
   Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/notes-api

# Redis
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_ACCESS_TOKEN_PRIVATE_KEY=your-private-key
JWT_ACCESS_TOKEN_PUBLIC_KEY=your-public-key
JWT_REFRESH_TOKEN_PRIVATE_KEY=your-refresh-private-key
JWT_REFRESH_TOKEN_PUBLIC_KEY=your-refresh-public-key

#Cookies
COOKIES_DOMAIN=localhost
```

4. **Run the Application**

```bash
# Development mode
npm run start:dev

# Build and run in production mode
npm run start:prod
```

### Running Tests

1. **Setup Test Environment**
   Create a `.env.test` file:

```env
# Server
PORT=5000
NODE_ENV=test

# Database
DATABASE_URL=mongodb://localhost:27017/notes-api

# Redis
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_ACCESS_TOKEN_PRIVATE_KEY=your-private-key
JWT_ACCESS_TOKEN_PUBLIC_KEY=your-public-key
JWT_REFRESH_TOKEN_PRIVATE_KEY=your-refresh-private-key
JWT_REFRESH_TOKEN_PUBLIC_KEY=your-refresh-public-key

#Cookies
COOKIES_DOMAIN=localhost
```

2. **Run Tests**

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration


# Run e2e tests
npm run test:e2e
```

## API Features

### Authentication

- User registration and login
- JWT-based authentication
- Token refresh mechanism
- Secure logout

### Notes Management

- Create, read, update, and delete notes
- Add tags to notes
- Share notes with other users
- Pagination support

### Search

- Full-text search across notes
- Search by title, content, or tags
- Paginated search results
