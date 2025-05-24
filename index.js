const express = require('express');
const RateLimiter = require('./RateLimiter'); 
const app = express();
const PORT = 3000;

// Create an instance of your custom rate limiter
const limiter = new RateLimiter(5, 15 * 60 * 1000); // 5 requests per 15 minutes

// Middleware to apply rate limiting
app.use((req, res, next) => {
  const userId = req.user.id; 

  if (!limiter.isAllowed(userId)) {
    return res.status(429).json({ message: 'Too many requests. Try again later.' });
  }

  next();
});

app.get('/', (req, res) => {
  res.send('Hello! You are within the rate limit.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
