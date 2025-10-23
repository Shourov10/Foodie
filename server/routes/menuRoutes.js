const express = require('express');
const router = express.Router();
const Menu = require('../models/Menu'); // adjust the path if needed

// Add a new menu item
router.post('/add', async (req, res) => {
  try {
    const { name, price, description, category, image } = req.body;
    const newMenu = new Menu({ name, price, description, category, image });
    await newMenu.save();
    res.status(201).json({ message: 'Menu item added successfully', newMenu });
  } catch (error) {
    console.error('Error adding menu item:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Get all menu items
router.get('/', async (req, res) => {
  try {
    const menu = await Menu.find();
    res.status(200).json(menu);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
