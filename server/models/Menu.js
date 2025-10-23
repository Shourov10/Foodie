const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: String, // Store image URL
    required: false
  }
});

const Menu = mongoose.model('Menu', menuSchema);
module.exports = Menu;
