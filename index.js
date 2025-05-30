require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const RateLimiter = require('./RateLimiter');

const app = express();
app.use(express.json());

const PORT = 3000;
const limiter = new RateLimiter(5, 60 * 1000); // 5 requests every 60 seconds

// JWT Auth middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
  } else {
    return res.status(401).json({ message: 'Authorization header missing or malformed' });
  }
}

// Rate limiting middleware
function applyRateLimit(req, res, next) {
  const userId = req.user.username;

  if (!limiter.isAllowed(userId)) {
    return res.status(429).json({ message: 'Too many requests. Try again later.' });
  }

  next();
}

// Login route to get a token
app.post('/login', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ message: 'Username required' });

  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Protected + rate-limited route
app.get('/protected', authenticateJWT, applyRateLimit, (req, res) => {
  res.json({ message: `Hello ${req.user.username}, you're within the rate limit.` });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
