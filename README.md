# Lab 4 - Secure Connect & Communication Platform

**Course:** Web Development III  
**Unit:** Unit 4  
**Topic:** Authentication, Protected Routes, Notes CRUD & Real-Time Chat using Socket.IO  

---

## Features Implemented
- **User Authentication:** Sign up and Login with password encryption using `bcrypt`.
- **JWT Protection:** Token-based authentication using `jsonwebtoken` for stateless auth.
- **RBAC:** Role Based Access Control separating normal users and admin permissions.
- **Notes CRUD API:** Full Create, Read, Update, Delete operations protected by JWT token validation.
- **Real-Time Chat:** Socket.IO rooms for bidirectional communication.
- **Event-Driven Logging:** Custom Node.js `EventEmitter` to track system events (signup, login, note operations, chat messages).

---

## Project Structure
```text
├── src/
│   ├── db/
│   │   └── inMemoryDb.js
│   ├── events/
│   │   └── eventEmitter.js
│   ├── middleware/
│   │   └── auth.js
│   └── routes/
│       ├── authRoutes.js
│       └── noteRoutes.js
├── public/
│   └── index.html
├── .env
├── package.json
└── server.js
```

---

## How to Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Open in browser:**
   Go to `http://localhost:5050` to test signup, login, notes API, and real-time chat.
