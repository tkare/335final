import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { getRecipeDetails } from '../api/recipes';

export default function RecipeModal({ recipe, onClose }) {
  const [fullRecipe, setFullRecipe] = useState(recipe);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchDetails() {
      if (recipe && recipe.id) {
        setLoading(true);
        try {
          const data = await getRecipeDetails(recipe.id);
          if (isMounted && data) {
            setFullRecipe(data);
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        setFullRecipe(recipe);
      }
    }
    fetchDetails();
    setChecked([]); // Reset checked state when recipe changes
    return () => { isMounted = false; };
  }, [recipe]);

  if (!fullRecipe) return null;
  const {
    title,
    image,
    readyInMinutes,
    servings,
    instructions
  } = fullRecipe;
  // Prefer extendedIngredients, fallback to ingredients
  const ingredients = fullRecipe.extendedIngredients || fullRecipe.ingredients || [];

  const handleCheck = idx => {
    setChecked(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Card sx={{ maxWidth: 600, width: '95vw', maxHeight: '90vh', overflowY: 'auto', borderRadius: 3, boxShadow: 6, position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 18, background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, fontSize: 22, fontWeight: 700, padding: '0.2rem 0.8rem', cursor: 'pointer', zIndex: 2 }}>×</button>
        {image && (
          <CardMedia
            component="img"
            height="260"
            image={image}
            alt={title}
            sx={{ objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
          />
        )}
        <CardContent>
          <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: 700, mb: 2 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
            {readyInMinutes !== undefined && (
              <span>Cooking Time: {readyInMinutes} minutes</span>
            )}
            {readyInMinutes !== undefined && servings !== undefined && <br />}
            {servings !== undefined && (
              <span>Servings: {servings}</span>
            )}
          </Typography>
          {loading && <Typography variant="body2" sx={{ mb: 2 }}>Loading full recipe...</Typography>}
          {Array.isArray(ingredients) && ingredients.length > 0 && (
            <div style={{ margin: '1.2rem 0' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Ingredients:</Typography>
              <ul style={{ textAlign: 'left', margin: 0, paddingLeft: 24, listStyle: 'none' }}>
                {ingredients.map((ing, idx) => {
                  let label = '';
                  if (ing && typeof ing === 'object' && (ing.amount || ing.unit || ing.name)) {
                    label = `${ing.amount ? ing.amount + ' ' : ''}${ing.unit ? ing.unit + ' ' : ''}${ing.name || ''}`;
                  } else {
                    label = typeof ing === 'object' ? (ing.name || '') : ing;
                  }
                  return (
                    <li key={idx} style={{ marginBottom: 6, display: 'flex', alignItems: 'center' }}>
                      <input type="checkbox" checked={checked.includes(idx)} onChange={() => handleCheck(idx)} style={{ marginRight: 8 }} />
                      <span style={{ textDecoration: checked.includes(idx) ? 'line-through' : 'none', color: checked.includes(idx) ? '#888' : '#222' }}>{label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {instructions && (
            <div style={{ margin: '1.2rem 0' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Instructions:</Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{instructions}</Typography>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 