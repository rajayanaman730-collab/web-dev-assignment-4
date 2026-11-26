const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { users } = require('../db/inMemoryDb');
const { verifyToken, checkAdmin } = require('../middleware/auth');
const myEmitter = require('../events/eventEmitter');

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    // check if user exists
    const userExists = users.find(u => u.username === username);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // hash password using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: Date.now().toString(),
      username: username,
      password: hashedPassword,
      role: role || 'user'
    };

    users.push(newUser);

    // emit custom event
    myEmitter.emit('userSignup', { username: newUser.username, role: newUser.role });

    res.status(201).json({
      message: 'User registered successfully',
      user: { id: newUser.id, username: newUser.username, role: newUser.role }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during signup', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password required' });
    }

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // generate jwt token
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'mysecretkey123', {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    });

    // emit login event
    myEmitter.emit('userLogin', { username: user.username });

    res.json({
      message: 'Login successful',
      token: token,
      user: payload
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login', error: err.message });
  }
});

// GET /api/auth/profile - protected route
router.get('/profile', verifyToken, (req, res) => {
  res.json({
    message: 'Profile fetched successfully',
    user: req.user
  });
});

// GET /api/auth/admin-dashboard - RBAC protected route
router.get('/admin-dashboard', verifyToken, checkAdmin, (req, res) => {
  res.json({
    message: 'Welcome Admin!',
    totalUsers: users.length,
    users: users.map(u => ({ id: u.id, username: u.username, role: u.role }))
  });
});

module.exports = router;
