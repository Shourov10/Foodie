// server/routes/orderRoutes.js
const express = require('express');
const router = express.Router();

// Example test route
router.get('/', (req, res) => {
  res.json({ message: 'Order routes are working ✅' });
});

module.exports = router;
