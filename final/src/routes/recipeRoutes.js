const express = require('express');
const router = express.Router();
const axios = require('axios');
const Recipe = require('../models/Recipe');

// Search recipes from Spoonacular API
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch`, {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
        query,
        addRecipeInformation: true,
        number: 10
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error searching recipes' });
  }
});

// Get recipe details from Spoonacular
router.get('/details/:id', async (req, res) => {
  try {
    const response = await axios.get(`https://api.spoonacular.com/recipes/${req.params.id}/information`, {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching recipe details' });
  }
});

// Save recipe to database
router.post('/save', async (req, res) => {
  try {
    const recipe = new Recipe(req.body);
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    res.status(400).json({ error: 'Error saving recipe' });
  }
});

// Get all saved recipes
router.get('/saved', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching saved recipes' });
  }
});

// Create new recipe
router.post('/create', async (req, res) => {
  try {
    const recipe = new Recipe({
      ...req.body,
      source: 'user'
    });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    res.status(400).json({ error: 'Error creating recipe' });
  }
});

// Search recipes by ingredients (inventory)
router.get('/by-ingredients', async (req, res) => {
  try {
    const { ingredients } = req.query; // comma-separated string
    const response = await axios.get('https://api.spoonacular.com/recipes/findByIngredients', {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
        ingredients,
        number: 10
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error searching recipes by ingredients' });
  }
});

// Render recipe details page
router.get('/view/:id', async (req, res) => {
  const { id } = req.params;
  const { source } = req.query;
  try {
    let recipe;
    if (source === 'spoonacular') {
      // Fetch from Spoonacular
      const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information`, {
        params: { apiKey: process.env.SPOONACULAR_API_KEY }
      });
      recipe = response.data;
      res.render('recipe', { recipe, isSpoonacular: true });
    } else {
      // Fetch from MongoDB
      recipe = await require('../models/Recipe').findById(id);
      res.render('recipe', { recipe, isSpoonacular: false });
    }
  } catch (error) {
    res.status(404).send('Recipe not found');
  }
});

// Ingredient autocomplete (proxy to Spoonacular)
router.get('/ingredient-autocomplete', async (req, res) => {
  try {
    const { query } = req.query;
    const response = await axios.get('https://api.spoonacular.com/food/ingredients/autocomplete', {
      params: {
        apiKey: process.env.SPOONACULAR_API_KEY,
        query,
        number: 10
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching ingredient suggestions' });
  }
});

module.exports = router;