// this is the navigation bar at the top
import React from 'react';

export default function Navigation({ setView }) {
  // render the nav links
  return (
    <nav className="nav-links" style={{ whiteSpace: 'nowrap' }}>
      {/* link to home */}
      <a href="#" onClick={() => setView('home')}>Home</a>
      {/* link to saved recipes */}
      <a href="#" onClick={() => setView('saved')}>Saved Recipes</a>
      {/* link to create recipe */}
      <a href="#" onClick={() => setView('create')}>Create Recipe</a>
    </nav>
  );
}
