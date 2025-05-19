const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  ingredients: [{
    name: String,
    amount: Number,
    unit: String
  }],
  instructions: {
    type: String
  },
  cookingTime: {
    type: Number
  },
  servings: {
    type: Number,
    required: true
  },
  imageUrl: {
    type: String
  },
  source: {
    type: String,
    enum: ['user', 'spoonacular'],
    required: true
  },
  spoonacularId: {
    type: Number
  },
  steps: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  spoonacularData: {
    type: Object
  }
});

module.exports = mongoose.model('Recipe', recipeSchema); 