# Citizen Complaint System - Backend API

## Overview
This is the backend API for the Citizen Complaint System built with Node.js, Express.js, MongoDB, and JWT authentication.

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/citizen-complaint-system
JWT_SECRET=your_secure_random_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

## Running the Server

### Development Mode (with auto-reload):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on the port specified in `.env` (default: 5000)

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /me` - Get current authenticated user (protected)

### Complaints Routes (`/api/complaints`)
- `GET /` - Get all complaints (with filtering)
- `GET /:id` - Get single complaint details
- `POST /` - Create new complaint (protected)
- `GET /user/my-complaints` - Get user's complaints (protected)
- `PUT /:id` - Update complaint (protected)
- `PUT /:id/status` - Update complaint status (admin/department only)
- `POST /:id/comments` - Add comment to complaint (protected)
- `DELETE /:id` - Delete complaint (protected)

### Users Routes (`/api/users`)
- `GET /` - Get all users (admin only)
- `GET /:id` - Get user details (protected)
- `PUT /profile/update` - Update user profile (protected)
- `PUT /:id/deactivate` - Deactivate user (admin only)
- `PUT /:id/activate` - Activate user (admin only)

### Departments Routes (`/api/departments`)
- `GET /` - Get all departments
- `GET /:id` - Get department details
- `POST /` - Create department (admin only)
- `PUT /:id` - Update department (admin only)
- `POST /:id/staff` - Add staff to department (admin only)
- `DELETE /:id/staff` - Remove staff from department (admin only)
- `PUT /:id/deactivate` - Deactivate department (admin only)

### Health Check
- `GET /api/health` - Check server status

## Request/Response Format

### Authentication Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Authentication Response
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "citizen"
  }
}
```

### Create Complaint Request
```json
{
  "title": "Pothole in Main Street",
  "description": "There is a large pothole near the market",
  "category": "roads",
  "priority": "high",
  "location": "Main Street, near market",
  "latitude": 12.34,
  "longitude": 56.78
}
```

## Authentication
All protected routes require the `Authorization` header with Bearer token:
```
Authorization: Bearer <your_jwt_token>
```

## User Roles
- **citizen**: Can create complaints, view their own complaints, add comments
- **admin**: Has full access to manage users, departments, and all complaints
- **department**: Can view and manage complaints assigned to their department

## Database Models

### User
- name, email, password, phone, address
- role (citizen, admin, department)
- department (reference to Department)
- isActive, createdAt

### Complaint
- title, description, category, priority, status
- location, latitude, longitude
- citizen (reference to User)
- department, assignedTo
- comments, resolution, resolutionDate
- createdAt, updatedAt

### Department
- name, email, phone, description, address
- categories, head, staff
- isActive, createdAt

## Error Handling
The API returns standard error responses:
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Security Features
- JWT token-based authentication
- Password hashing with bcrypt
- CORS configuration
- Role-based access control
- Request validation

## Project Structure
```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Auth logic
│   ├── complaintController.js
│   ├── userController.js
│   └── departmentController.js
├── middleware/
│   └── auth.js              # JWT & authorization
├── models/
│   ├── User.js
│   ├── Complaint.js
│   └── Department.js
├── routes/
│   ├── auth.js
│   ├── complaints.js
│   ├── users.js
│   └── departments.js
├── utils/
│   ├── AppError.js
│   └── validators.js
├── .env                     # Environment variables
├── .env.example
├── server.js                # Entry point
└── package.json
```

## Development Notes
- Use `npm run dev` for development with nodemon
- Always keep `.env` file in `.gitignore`
- Test API endpoints using Postman or similar tools
- Update `.env` variables for different environments

## Support
For any issues or questions, please refer to the main project README.
