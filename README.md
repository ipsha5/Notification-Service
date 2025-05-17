# Notification Service

A RESTful API for sending notifications to users through multiple channels (Email, SMS, and in-app).

## Features

- Send notifications via Email, SMS, and in-app channels
- Store notification history
- View notifications by user
- Robust API endpoints
- In-memory data storage (standalone mode)

## Requirements

- Node.js (v12 or higher)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/ipsha5/notification-service.git
   cd notification-service
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running the Application

### Starting the API Server

```
npm start
```

For development with auto-restart:
```
npm run dev
```

The application runs in standalone mode with in-memory storage, so no external databases or message queues are required.

## API Documentation

The API is documented using Swagger UI. Once the application is running, you can access the API documentation at:

```
http://localhost:3000/api-docs
```

This interactive documentation allows you to:
- Browse all available endpoints
- View request/response formats
- Test the API directly from the browser

## API Endpoints

### Notifications

- **Send a Notification**
  - `POST /api/notifications`
  - Request Body:
    ```json
    {
      "userId": "user_id",
      "type": "email",
      "title": "Notification Title",
      "message": "Notification Message",
      "metadata": {
        "key1": "value1",
        "key2": "value2"
      }
    }
    ```

- **Get User Notifications**
  - `GET /api/users/{id}/notifications`
  - Query Parameters:
    - page (optional): Page number for pagination
    - limit (optional): Number of notifications per page

- **Mark Notification as Read**
  - `PATCH /api/notifications/{id}/read`

### Users

- **Create User**
  - `POST /api/users`
  - Request Body:
    ```json
    {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "preferences": {
        "email": true,
        "sms": false,
        "inApp": true
      }
    }
    ```

- **Get All Users**
  - `GET /api/users`

- **Get User by ID**
  - `GET /api/users/{id}`

- **Update User**
  - `PUT /api/users/{id}`

- **Delete User**
  - `DELETE /api/users/{id}`

## Testing API Endpoints (Windows PowerShell)

Here are commands to test the API using PowerShell:

### Get all users
```powershell
Invoke-WebRequest -Method GET -Uri "http://localhost:3000/api/users"
```

### Get user by ID
```powershell
Invoke-WebRequest -Method GET -Uri "http://localhost:3000/api/users/1"
```

### Create a new user
```powershell
Invoke-WebRequest -Method POST -Uri "http://localhost:3000/api/users" -Body '{"name":"John Smith","email":"john.smith@example.com","phone":"+1122334455"}' -ContentType "application/json"
```

### Get user notifications
```powershell
Invoke-WebRequest -Method GET -Uri "http://localhost:3000/api/users/1/notifications"
```

### Send a notification
```powershell
Invoke-WebRequest -Method POST -Uri "http://localhost:3000/api/notifications" -Body '{"userId":"1","type":"email","title":"Test Notification","message":"This is a test notification","metadata":{"source":"test"}}' -ContentType "application/json"
```

## Architecture

The application follows a modular architecture:

- **Models**: In-memory data structures for users and notifications
- **Controllers**: Handle API requests and responses
- **Services**: Business logic for notifications and users
- **Routes**: API endpoints definition

## Assumptions

- In standalone mode, all data is stored in memory and will be lost when the server restarts
- Email notifications are simulated (logged to console)
- SMS notifications are simulated (logged to console)
- In-app notifications are stored in-memory and can be fetched by the client

## Future Improvements

- Add persistent storage with MongoDB
- Add message queuing with RabbitMQ or Kafka for asynchronous processing
- Implement retry mechanism for failed notifications
- Add authentication and authorization
- Implement real-time notifications with WebSockets
- Add more notification channels (e.g., push notifications)
- Add notification templates
- Implement bulk notifications
