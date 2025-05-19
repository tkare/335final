// src/components/InventorySection.jsx
import React, { useState } from 'react';
import { ingredientAutocomplete, searchByInventory, saveRecipeToDB, getRecipeDetails } from '../api/recipes';
import RecipeCard from './RecipeCard';

export default function InventorySection({ onRecipeClick }) {
  const [inventory, setInventory] = useState(() => JSON.parse(localStorage.getItem('inventory')) || []);
  const [input, setInput] = useState('');
  const [autocomplete, setAutocomplete] = useState([]);
  const [results, setResults] = useState([]);

  const handleInput = async e => {
    setInput(e.target.value);
    if (e.target.value.length < 2) {
      setAutocomplete([]);
      return;
    }
    const suggestions = await ingredientAutocomplete(e.target.value);
    setAutocomplete(suggestions);
  };

  const addIngredient = name => {
    if (!inventory.includes(name)) {
      const newInventory = [...inventory, name];
      setInventory(newInventory);
      localStorage.setItem('inventory', JSON.stringify(newInventory));
    }
    setInput('');
    setAutocomplete([]);
  };

  const removeIngredient = idx => {
    const newInventory = inventory.filter((_, i) => i !== idx);
    setInventory(newInventory);
    localStorage.setItem('inventory', JSON.stringify(newInventory));
  };

  const handleSearch = async () => {
    if (inventory.length === 0) {
      alert('Add some ingredients to your inventory first!');
      return;
    }
    const data = await searchByInventory(inventory);
    setResults(Array.isArray(data) ? data : []);
  };

  const clearInventory = () => {
    setInventory([]);
    localStorage.setItem('inventory', JSON.stringify([]));
  };

  function mapSpoonacularToRecipe(recipe) {
    return {
      title: recipe.title,
      ingredients: (recipe.extendedIngredients || []).map(ing => ({
        name: ing.name,
        amount: ing.amount,
        unit: ing.unit
      })),
      instructions: recipe.instructions || (
        recipe.analyzedInstructions && recipe.analyzedInstructions[0]
          ? recipe.analyzedInstructions[0].steps.map(s => s.step).join(' ')
          : ''
      ),
      cookingTime: recipe.readyInMinutes,
      servings: recipe.servings,
      imageUrl: recipe.image || '',
      source: 'spoonacular',
      spoonacularId: recipe.id,
      steps: recipe.analyzedInstructions && recipe.analyzedInstructions[0]
        ? recipe.analyzedInstructions[0].steps.map(s => s.step)
        : [],
      spoonacularData: recipe
    };
  }

  const handleSaveRecipe = async (recipe) => {
    try {
      // Always fetch full details before saving
      const fullRecipe = await getRecipeDetails(recipe.id);
      const payload = mapSpoonacularToRecipe(fullRecipe);
      await saveRecipeToDB(payload);
      alert(`Saved recipe: ${recipe.title}`);
    } catch (err) {
      alert('Recipe already saved or failed to save.');
    }
  };

  return (
    <section className="inventory-section">
      <form onSubmit={e => { e.preventDefault(); addIngredient(input); }}>
        <div className="inventory-input-wrapper" style={{ position: 'relative' }}>
          <input
            value={input}
            onChange={handleInput}
            placeholder="Add ingredient..."
            autoComplete="off"
          />
          {autocomplete.length > 0 && (
            <div className="inventory-autocomplete-list">
              {autocomplete.map((item, idx) => (
                <div
                  key={idx}
                  className="inventory-autocomplete-item"
                  onClick={() => addIngredient(item.name)}
                >
                  {item.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <button type="submit">Add</button>
        <button type="button" onClick={clearInventory}>Clear</button>
      </form>
      <div id="inventoryList">
        {inventory.map((item, idx) => (
          <div key={idx} className="inventory-chip">
            {item}
            <button onClick={() => removeIngredient(idx)}>&times;</button>
          </div>
        ))}
      </div>
      <button id="findByInventory" onClick={handleSearch}>Find Recipes</button>
      <div id="inventoryResults">
        {(Array.isArray(results) ? results : []).map(recipe => (
          <RecipeCard key={recipe.id || recipe._id} recipe={recipe} onClick={() => onRecipeClick && onRecipeClick(recipe)} onSave={handleSaveRecipe} />
        ))}
      </div>
    </section>
  );
}