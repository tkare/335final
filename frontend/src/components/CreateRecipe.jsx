// this is the form for creating a new recipe
import React, { useState } from 'react';
import { createRecipe } from '../api/recipes.js';

const COMMON_UNITS = [
  // common units for ingredients
  '', 'g', 'gram', 'grams', 'kg', 'kilogram', 'kilograms',
  'ml', 'milliliter', 'milliliters', 'l', 'liter', 'liters',
  'tsp', 'teaspoon', 'teaspoons', 'tbsp', 'tablespoon', 'tablespoons',
  'cup', 'cups', 'oz', 'ounce', 'ounces', 'lb', 'pound', 'pounds',
  'pinch', 'dash', 'clove', 'cloves', 'slice', 'slices', 'piece', 'pieces',
  'can', 'cans', 'package', 'packages', 'stick', 'sticks', 'quart', 'quarts', 'pint', 'pints'
];

export default function CreateRecipe() {
  // state for all the form fields
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [cookingTime, setCookingTime] = useState('');
  const [servings, setServings] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);

  // handle changes to ingredient fields
  const handleIngredientChange = (idx, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[idx][field] = value;
    setIngredients(newIngredients);
  };

  // add a new ingredient row
  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  };

  // remove an ingredient row
  const removeIngredient = idx => {
    setIngredients(ingredients.filter((_, i) => i !== idx));
  };

  // handle form submit
  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('instructions', instructions);
    formData.append('cookingTime', cookingTime);
    formData.append('servings', servings);
    formData.append('ingredients', JSON.stringify(ingredients.filter(i => i.name && i.quantity)));

    try {
      await createRecipe(formData);
      alert('Recipe created successfully!');
      setTitle('');
      setInstructions('');
      setCookingTime('');
      setServings('');
      setIngredients([{ name: '', quantity: '', unit: '' }]);
    } catch {
      alert('Failed to create recipe. Please try again.');
    }
  };

  // render the form
  return (
    <form id="recipeForm" onSubmit={handleSubmit}>
      {/* input for recipe title */}
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" required />
      {/* textarea for instructions */}
      <textarea value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="Instructions" required />
      {/* input for cooking time */}
      <input value={cookingTime} onChange={e => setCookingTime(e.target.value)} placeholder="Cooking Time" type="number" required />
      {/* input for servings */}
      <input value={servings} onChange={e => setServings(e.target.value)} placeholder="Servings" type="number" required />
      <div>
        <label>Ingredients:</label>
        {/* map through all ingredient rows */}
        {ingredients.map((ing, idx) => (
          <div key={idx} className="ingredient-row">
            {/* input for quantity */}
            <input
              value={ing.quantity}
              onChange={e => handleIngredientChange(idx, 'quantity', e.target.value)}
              placeholder="Quantity"
              required
              style={{ width: '20%', marginRight: 8 }}
            />
            {/* input for unit */}
            <input
              value={ing.unit}
              onChange={e => handleIngredientChange(idx, 'unit', e.target.value)}
              placeholder="Unit"
              list="unit-options"
              style={{ width: '25%', marginRight: 8 }}
            />
            <datalist id="unit-options">
              {COMMON_UNITS.map(unit => <option key={unit} value={unit} />)}
            </datalist>
            {/* input for ingredient name */}
            <input
              value={ing.name}
              onChange={e => handleIngredientChange(idx, 'name', e.target.value)}
              placeholder="Name"
              required
              style={{ width: '40%', marginRight: 8 }}
            />
            {/* button to remove ingredient */}
            <button type="button" onClick={() => removeIngredient(idx)}>&times;</button>
          </div>
        ))}
        {/* button to add ingredient */}
        <button type="button" onClick={addIngredient}>Add Ingredient</button>
      </div>
      {/* submit button */}
      <button type="submit">Create Recipe</button>
    </form>
  );
}