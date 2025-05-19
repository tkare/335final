// this is the search section for finding recipes
import React, { useState, useEffect } from 'react';
import { searchRecipes, saveRecipeToDB, getRecipeDetails } from '../api/recipes';
import RecipeCard from './RecipeCard';

export default function SearchSection({ onRecipeClick }) {
  // state for search query and results
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // load last search from local storage
  useEffect(() => {
    const lastSearch = localStorage.getItem('lastSearchQuery');
    const lastResults = localStorage.getItem('lastSearchResults');
    if (lastSearch && lastResults) {
      setQuery(lastSearch);
      setResults(JSON.parse(lastResults));
    }
  }, []);

  // handle searching for recipes
  const handleSearch = async () => {
    if (!query.trim()) return;
    const data = await searchRecipes(query);
    const safeResults = Array.isArray(data.results) ? data.results : [];
    setResults(safeResults);
    localStorage.setItem('lastSearchQuery', query);
    localStorage.setItem('lastSearchResults', JSON.stringify(safeResults));
  };

  // map spoonacular api data to our recipe format
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

  // handle saving a recipe
  const handleSaveRecipe = async (recipe) => {
    try {
      // always fetch full details before saving
      const fullRecipe = await getRecipeDetails(recipe.id);
      const payload = mapSpoonacularToRecipe(fullRecipe);
      await saveRecipeToDB(payload);
      alert(`Saved recipe: ${recipe.title}`);
    } catch (err) {
      alert('Recipe already saved or failed to save.');
    }
  };

  // clear the search
  const handleClearSearch = () => {
    setQuery('');
    setResults([]);
    localStorage.removeItem('lastSearchQuery');
    localStorage.removeItem('lastSearchResults');
  };

  // render the search section
  return (
    <section className="search-section">
      <h2 className="discover-title">Discover Recipes</h2>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {/* input for search query */}
        <input
          id="searchInput"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for recipes..."
        />
        {/* search button */}
        <button
          id="searchButton"
          onClick={handleSearch}
          style={{
            background: '#4caf50',
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.25rem',
            border: 'none',
            borderRadius: 8,
            padding: '0.5rem 1.8rem',
            marginLeft: 16,
            cursor: 'pointer',
            height: 52,
            boxSizing: 'border-box',
            lineHeight: 1.2,
            display: 'inline-block',
          }}
        >
          Search
        </button>
        {/* clear search button */}
        <button
          id="clearSearchButton"
          onClick={handleClearSearch}
          style={{
            background: '#fff',
            color: '#4caf50',
            fontWeight: 700,
            fontSize: '1.25rem',
            border: '2px solid #4caf50',
            borderRadius: 8,
            padding: '0.5rem 1.8rem',
            marginLeft: 12,
            cursor: 'pointer',
            height: 52,
            boxSizing: 'border-box',
            lineHeight: 1.2,
            display: 'inline-block',
            transition: 'background 0.2s, color 0.2s',
            whiteSpace: 'nowrap',
            minWidth: 160,
          }}
          onMouseOver={e => { e.target.style.background = '#e8f5e9'; }}
          onMouseOut={e => { e.target.style.background = '#fff'; }}
        >
          Clear Search
        </button>
      </div>
      <div id="searchResults">
        {/* show all search results as recipe cards */}
        {(Array.isArray(results) ? results : []).map(recipe => (
          <RecipeCard key={recipe.id || recipe._id} recipe={recipe} onClick={() => onRecipeClick && onRecipeClick(recipe)} onSave={handleSaveRecipe} />
        ))}
      </div>
    </section>
  );
}
