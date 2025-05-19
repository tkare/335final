// src/api/recipes.js
export async function searchRecipes(query) {
    const res = await fetch(`/api/recipes/search?query=${encodeURIComponent(query)}`);
    return res.json();
  }
  
  export async function getSavedRecipes() {
    const res = await fetch('/api/recipes/saved');
    return res.json();
  }
  
  export async function saveRecipe(recipe) {
    const res = await fetch('/api/recipes/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe),
    });
    return res.json();
  }
  
  export async function deleteRecipe(id) {
    const res = await fetch(`/api/recipes/delete/${id}`, { method: 'DELETE' });
    return res.json();
  }
  
  export async function getRecipeDetails(id) {
    const res = await fetch(`/api/recipes/details/${id}`);
    return res.json();
  }
  
  export async function createRecipe(formData) {
    // If no image is provided, set the imageUrl to '/homemade.png'
    if (!formData.has('imageUrl')) {
      formData.append('imageUrl', '/homemade.png');
    }
    const res = await fetch('/api/recipes/create', {
      method: 'POST',
      body: formData,
    });
    return res.json();
  }
  
  export async function ingredientAutocomplete(query) {
    const res = await fetch(`/api/recipes/ingredient-autocomplete?query=${encodeURIComponent(query)}`);
    return res.json();
  }
  
  export async function searchByInventory(ingredients) {
    const res = await fetch(`/api/recipes/by-ingredients?ingredients=${encodeURIComponent(ingredients.join(','))}`);
    return res.json();
  }
  
  // --- Saved Recipes API (MongoDB) ---
  export async function getAllSavedRecipes() {
    const res = await fetch('/api/savedRecipes');
    if (!res.ok) throw new Error('Failed to fetch saved recipes');
    return res.json();
  }
  
  export async function saveRecipeToDB(recipe) {
    const res = await fetch('/api/savedRecipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recipe),
    });
    if (!res.ok) throw new Error('Failed to save recipe');
    return res.json();
  }
  
  export async function deleteSavedRecipeFromDB(id) {
    const res = await fetch(`/api/savedRecipes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete recipe');
    return res.json();
  }