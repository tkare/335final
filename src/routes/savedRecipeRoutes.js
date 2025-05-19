const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// GET all saved recipes
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find({});
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch saved recipes.' });
  }
});

// POST save a recipe (from Spoonacular or user)
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    // If saving a Spoonacular recipe, use spoonacularId as unique
    let existing;
    if (data.spoonacularId) {
      existing = await Recipe.findOne({ spoonacularId: data.spoonacularId });
    } else {
      // For user recipes, check by title and createdAt (or other unique fields)
      existing = await Recipe.findOne({ title: data.title, source: 'user' });
    }
    if (existing) {
      return res.status(409).json({ error: 'Recipe already saved.' });
    }
    const recipe = new Recipe(data);
    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ error: 'Failed to save recipe.' });
  }
});

// DELETE a saved recipe by MongoDB _id or spoonacularId
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Try to delete by _id first, then by spoonacularId
    let result = await Recipe.findByIdAndDelete(id);
    if (!result) {
      result = await Recipe.findOneAndDelete({ spoonacularId: id });
    }
    if (!result) {
      return res.status(404).json({ error: 'Recipe not found.' });
    }
    res.json({ message: 'Recipe deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete recipe.' });
  }
});

module.exports = router; 