import React, { useState, useEffect } from 'react';
import RecipeCard from './RecipeCard';
import RecipeModal from './RecipeModal';
import { getAllSavedRecipes, deleteSavedRecipeFromDB } from '../api/recipes';

export default function SavedRecipes() {
  // state for recipes, selection, loading, etc
  const [recipes, setRecipes] = useState([]);
  const [selected, setSelected] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalRecipe, setModalRecipe] = useState(null);

  // load recipes on mount
  useEffect(() => {
    async function fetchRecipes() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllSavedRecipes();
        setRecipes(data);
      } catch (err) {
        setError('Failed to load saved recipes.');
      } finally {
        setLoading(false);
      }
    }
    fetchRecipes();
  }, []);

  // delete a single recipe
  const handleDelete = async (recipe) => {
    try {
      await deleteSavedRecipeFromDB(recipe._id || recipe.spoonacularId);
      setRecipes(recipes.filter(r => (r._id || r.spoonacularId) !== (recipe._id || recipe.spoonacularId)));
      setSelected(selected.filter(id => id !== (recipe._id || recipe.spoonacularId)));
    } catch {
      alert('Failed to delete recipe.');
    }
  };

  // handle selecting recipes
  const handleSelect = (recipe, checked) => {
    const id = recipe._id || recipe.spoonacularId;
    setSelected(prev => checked ? [...prev, id] : prev.filter(i => i !== id));
  };

  // delete all selected recipes
  const handleDeleteSelected = async () => {
    setShowConfirm(false);
    try {
      await Promise.all(selected.map(id => deleteSavedRecipeFromDB(id)));
      setRecipes(recipes.filter(r => !selected.includes(r._id || r.spoonacularId)));
      setSelected([]);
    } catch {
      alert('Failed to delete one or more recipes.');
    }
  };

  // render the saved recipes
  return (
    <div style={{ padding: 24 }}>
      <h2>Saved Recipes</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && recipes.length === 0 && <p>Your saved recipes will appear here.</p>}
      {!loading && recipes.length > 0 && (
        <>
          {/* show delete selected button if any selected */}
          {selected.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <button onClick={() => setShowConfirm(true)} style={{ background: '#e57373', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 6, padding: '0.5rem 1.2rem', cursor: 'pointer' }}>
                Delete Selected ({selected.length})
              </button>
            </div>
          )}
          {/* show all recipe cards */}
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {recipes.map(recipe => (
              <RecipeCard
                key={recipe._id || recipe.spoonacularId}
                recipe={recipe}
                onDelete={handleDelete}
                selected={selected.includes(recipe._id || recipe.spoonacularId)}
                onSelect={handleSelect}
                onClick={() => setModalRecipe(recipe)}
              />
            ))}
          </div>
        </>
      )}
      {/* show modal for recipe details */}
      {modalRecipe && <RecipeModal recipe={modalRecipe} onClose={() => setModalRecipe(null)} />}
      {showConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 10, boxShadow: '0 2px 16px rgba(0,0,0,0.18)' }}>
            <h3>Confirm Deletion</h3>
            <p>Are you sure you want to delete {selected.length} selected recipe{selected.length > 1 ? 's' : ''}?</p>
            <button onClick={handleDeleteSelected} style={{ background: '#e57373', color: '#fff', fontWeight: 700, border: 'none', borderRadius: 6, padding: '0.5rem 1.2rem', marginRight: 12, cursor: 'pointer' }}>Yes, Delete</button>
            <button onClick={() => setShowConfirm(false)} style={{ background: '#bbb', color: '#222', fontWeight: 700, border: 'none', borderRadius: 6, padding: '0.5rem 1.2rem', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
} 