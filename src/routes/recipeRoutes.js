const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const path = require('path');

// Search recipes from Spoonacular API
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    const params = new URLSearchParams({
      apiKey: process.env.SPOONACULAR_API_KEY,
      query,
      addRecipeInformation: 'true',
      number: '10'
    });
    const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?${params}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error searching recipes' });
  }
});

// Get recipe details from Spoonacular
router.get('/details/:id', async (req, res) => {
  try {
    const params = new URLSearchParams({
      apiKey: process.env.SPOONACULAR_API_KEY
    });
    const response = await fetch(`https://api.spoonacular.com/recipes/${req.params.id}/information?${params}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching recipe details' });
  }
});

// Save recipe to database
router.post('/save', async (req, res) => {
  // If the payload is wrapped in a 'spoonacular' property, use that
  const data = req.body.spoonacular ? req.body.spoonacular : req.body;
  console.log('Saving recipe:', data);
  try {
    const recipe = new Recipe(data);
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    console.error('Error saving recipe:', error);
    res.status(400).json({ error: error.message, details: error.errors });
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

// Create new recipe (no image upload)
router.post('/create', async (req, res) => {
  try {
    const { title, instructions, cookingTime, servings, imageUrl: bodyImageUrl } = req.body;
    let ingredients = [];
    if (req.body.ingredients) {
      try {
        ingredients = JSON.parse(req.body.ingredients);
      } catch (e) {
        ingredients = [];
      }
    }
    // Only use imageUrl from body or default to /homemade.png
    const imageUrl = bodyImageUrl || '/homemade.png';
    const recipe = new Recipe({
      title,
      instructions,
      cookingTime,
      servings,
      ingredients: ingredients.map(ing => ({
        amount: ing.quantity,
        unit: ing.unit,
        name: ing.name
      })),
      imageUrl,
      source: 'user'
    });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (error) {
    res.status(400).json({ error: 'Error creating recipe', details: error.message });
  }
});

// Search recipes by ingredients (inventory)
router.get('/by-ingredients', async (req, res) => {
  try {
    const { ingredients } = req.query; // comma-separated string
    const params = new URLSearchParams({
      apiKey: process.env.SPOONACULAR_API_KEY,
      ingredients,
      number: '10'
    });
    const response = await fetch(`https://api.spoonacular.com/recipes/findByIngredients?${params}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
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
      if (!process.env.SPOONACULAR_API_KEY) {
        return res.status(500).json({ error: 'Spoonacular API key is missing' });
      }
      const params = new URLSearchParams({
        apiKey: process.env.SPOONACULAR_API_KEY
      });
      const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?${params}`);
      const data = await response.json();
      recipe = data;
      res.json({ recipe, isSpoonacular: true });
    } else {
      // Fetch from MongoDB
      recipe = await require('../models/Recipe').findById(id);
      res.json({ recipe, isSpoonacular: false });
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: 'Recipe not found' });
  }
});

// Ingredient autocomplete (proxy to Spoonacular)
router.get('/ingredient-autocomplete', async (req, res) => {
  try {
    const { query } = req.query;
    const params = new URLSearchParams({
      apiKey: process.env.SPOONACULAR_API_KEY,
      query,
      number: '10'
    });
    const response = await fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?${params}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching ingredient suggestions' });
  }
});

// Delete a saved recipe by ID
router.delete('/delete/:id', async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Recipe deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting recipe' });
  }
});

module.exports = router;