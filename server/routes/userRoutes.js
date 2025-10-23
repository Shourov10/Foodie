// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();

// Example test route
router.get('/', (req, res) => {
  res.json({ message: 'User routes are working ✅' });
});

module.exports = router;
