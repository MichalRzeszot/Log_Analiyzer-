# Log Analyzer Backend 🚀

AI-powered IT failure log analyzer with automated remediation capabilities using OpenAI GPT-4.

## 📋 Features

- ✅ **User Management** - Registration, authentication, JWT tokens
- ✅ **Log Upload** - Support for .txt, .log, .json files
- ✅ **AI Analysis** - OpenAI GPT-4 integration for log analysis
- ✅ **Problem Detection** - Automatic detection of issues in logs
- ✅ **Root Cause Analysis** - AI-powered root cause identification
- ✅ **Remediation Actions** - Proposed automated fixes
- ✅ **PDF Reports** - Generate detailed analysis reports
- ✅ **Audit Logging** - Complete action audit trail
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Security** - Helmet, CORS, input validation

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL + TypeORM
- **Authentication**: JWT (jsonwebtoken)
- **AI**: OpenAI API (GPT-4)
- **Validation**: Joi
- **Logging**: Winston
- **Security**: Helmet, bcryptjs, express-rate-limit
- **PDF Generation**: PDFKit

## 📦 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── env.ts       # Environment variables
│   │   ├── database.ts  # TypeORM database config
│   │   └── openai.ts    # OpenAI configuration
│   ├── models/          # TypeORM entities
│   ├── repositories/    # Data access layer
│   ├── services/        # Business logic
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── utils/           # Utilities
│   ├── app.ts          # Express app setup
│   └── server.ts       # Server entry point
├── dist/                # Compiled JavaScript
├── package.json
├── tsconfig.json
└── .env.example
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- PostgreSQL >= 12
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup PostgreSQL database**
   ```bash
   # Create a new database
   createdb log_analyzer
   ```

5. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

Server will be running at `http://localhost:5000`

## 📚 API Documentation

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

#### Get Current User
```
GET /api/auth/me
Authorization: Bearer <token>
```

### Log Endpoints

#### Upload Log
```
POST /api/logs/upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "fileName": "error.log",
  "fileType": "log",
  "content": "[ERROR] Database connection failed..."
}
```

#### Get Logs
```
GET /api/logs?page=1&limit=10
Authorization: Bearer <token>
```

#### Analyze Log
```
POST /api/logs/:id/analyze
Authorization: Bearer <token>
```

### Analysis Endpoints

#### Get Analyses
```
GET /api/analyses?page=1&limit=10&minConfidence=0.8
Authorization: Bearer <token>
```

#### Get Analysis Details
```
GET /api/analyses/:id
Authorization: Bearer <token>
```

### Remediation Endpoints

#### Get Pending Remediations
```
GET /api/remediations/pending?page=1&limit=10
Authorization: Bearer <token>
```

#### Approve Remediation
```
POST /api/remediations/:id/approve
Authorization: Bearer <token>
```

#### Execute Remediation
```
POST /api/remediations/:id/execute
Authorization: Bearer <token>
```

### Report Endpoints

#### Generate Report
```
POST /api/reports/:analysisId/generate
Authorization: Bearer <token>
```

#### Download Report
```
GET /api/reports/:reportFilename/download
Authorization: Bearer <token>
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcryptjs with configurable rounds
- **Rate Limiting** - Prevent brute force attacks
- **CORS** - Cross-origin resource sharing configuration
- **Helmet** - Security headers
- **Input Validation** - Joi schema validation
- **Audit Logging** - Complete action tracking
- **Error Handling** - Secure error messages

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|----------|
| NODE_ENV | Environment | development |
| PORT | Server port | 5000 |
| DB_HOST | Database host | localhost |
| DB_PORT | Database port | 5432 |
| DB_USERNAME | Database user | postgres |
| DB_PASSWORD | Database password | - |
| DB_DATABASE | Database name | log_analyzer |
| JWT_SECRET | JWT secret key | - |
| OPENAI_API_KEY | OpenAI API key | - |
| CORS_ORIGIN | Allowed origins | http://localhost:3000 |
| UPLOAD_DIR | File upload directory | ./uploads |
| MAX_FILE_SIZE | Max file size (bytes) | 10485760 |

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

## 📊 Database Schema

### Users Table
- id (PK)
- email (UNIQUE)
- passwordHash
- firstName
- lastName
- role (admin | user)
- isActive
- createdAt
- updatedAt

### Logs Table
- id (PK)
- userId (FK)
- fileName
- fileType (txt | log | json)
- content
- filePath
- fileSize
- status (uploaded | analyzing | analyzed | error)
- errorMessage
- createdAt
- updatedAt

### Analyses Table
- id (PK)
- logId (FK, UNIQUE)
- userId (FK)
- detectedProblem
- rootCause
- confidenceLevel
- proposedActions (JSONB)
- aiResponse (JSONB)
- analysisTime
- status
- createdAt

### RemediationActions Table
- id (PK)
- analysisId (FK)
- userId (FK)
- actionType
- actionDescription
- parameters (JSONB)
- status (pending | approved | executing | executed | failed)
- executedAt
- result (JSONB)
- createdAt

### AuditLogs Table
- id (PK)
- userId (FK, nullable)
- action
- resourceType
- resourceId
- ipAddress
- userAgent
- details (JSONB)
- createdAt

## 🔄 Workflow Example

1. **User Registration** → `/api/auth/register`
2. **User Login** → `/api/auth/login` (get JWT token)
3. **Upload Log** → `/api/logs/upload`
4. **Analyze Log** → `/api/logs/:id/analyze` (triggers OpenAI)
5. **View Analysis** → `/api/analyses/:id`
6. **Review Remediations** → `/api/remediations/pending`
7. **Approve Action** → `/api/remediations/:id/approve`
8. **Execute Action** → `/api/remediations/:id/execute`
9. **Generate Report** → `/api/reports/:analysisId/generate`
10. **Download Report** → `/api/reports/:filename/download`

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Verify PostgreSQL is running
psql -U postgres

# Check .env variables
cat .env
```

### OpenAI API Error
```bash
# Verify API key
echo $OPENAI_API_KEY

# Test API connection
curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Port Already in Use
```bash
# Change PORT in .env
PORT=5001
```

## 📈 Performance Optimization

- Database connection pooling
- Query result caching
- File upload size limits
- Rate limiting on all endpoints
- Request timeout configuration
- Async/await for non-blocking operations

## 🚀 Deployment

```bash
# Build for production
npm run build

# Start production server
NODE_ENV=production npm start
```

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💼 Author

Your Name

## 🤝 Contributing

Contributions are welcome! Please follow the existing code style and add tests for new features.

## 📞 Support

For issues and questions, please create an issue in the repository.
