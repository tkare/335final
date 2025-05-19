import React, { useState } from 'react';
import Navigation from './components/Navigation.jsx';
import SearchSection from './components/SearchSection.jsx';
import SavedRecipes from './components/SavedRecipes.jsx';
import CreateRecipe from './components/CreateRecipe.jsx';
import InventorySection from './components/InventorySection.jsx';
import RecipeModal from './components/RecipeModal.jsx';
import './styles/App.css';

function App() {
  const [view, setView] = useState('home');
  const [searchMode, setSearchMode] = useState('discover'); // 'discover' or 'inventory' (a user's inventory-based search)
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const handleRecipeClick = (recipe) => setSelectedRecipe(recipe);
  const handleCloseModal = () => setSelectedRecipe(null);

  return (
    <div className="App">
      <div className="header-bar">
        <span className="app-title">(Global*) Recipe Manager</span>
        <Navigation setView={setView} />
      </div>
      {view === 'home' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0 1rem 0' }}>
            <button
              className={searchMode === 'discover' ? 'active-toggle' : ''}
              style={{ marginRight: 12, padding: '0.7rem 2rem', fontWeight: 600, borderRadius: 6, border: 'none', background: searchMode === 'discover' ? '#4caf50' : '#eee', color: searchMode === 'discover' ? '#fff' : '#333', cursor: 'pointer', fontSize: '1rem' }}
              onClick={() => setSearchMode('discover')}
            >
              Discover Recipes
            </button>
            <button
              className={searchMode === 'inventory' ? 'active-toggle' : ''}
              style={{ padding: '0.7rem 2rem', fontWeight: 600, borderRadius: 6, border: 'none', background: searchMode === 'inventory' ? '#4caf50' : '#eee', color: searchMode === 'inventory' ? '#fff' : '#333', cursor: 'pointer', fontSize: '1rem' }}
              onClick={() => setSearchMode('inventory')}
            >
              Search by Inventory
            </button>
          </div>
          {searchMode === 'discover' && <SearchSection onRecipeClick={handleRecipeClick} />}
          {searchMode === 'inventory' && <InventorySection onRecipeClick={handleRecipeClick} />}
        </>
      )}
      {view === 'saved' && <SavedRecipes />}
      {view === 'create' && <CreateRecipe />}
      {selectedRecipe && <RecipeModal recipe={selectedRecipe} onClose={handleCloseModal} />}
    </div>
  );
}

export default App;
