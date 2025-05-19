// this is a card for showing a recipe
import React from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/312x231?text=No+Image';

export default function RecipeCard({ recipe, onClick, onSave, onDelete, selected, onSelect }) {
  // get all the fields from the recipe
  const {
    id,
    _id,
    title,
    image,
    imageUrl,
    readyInMinutes,
    cookingTime,
    servings
  } = recipe;

  // pick the right image and time fields
  const imageUrlFinal = image || imageUrl || PLACEHOLDER_IMAGE;
  const time = readyInMinutes !== undefined ? readyInMinutes : cookingTime;
  const keyId = id || _id;

  // render the card
  return (
    <Card className="mui-recipe-card" sx={{ maxWidth: 345, m: 2, boxShadow: 3, borderRadius: 3, transition: 'box-shadow 0.2s', position: 'relative', ':hover': { boxShadow: 8, cursor: onClick ? 'pointer' : 'default' } }} onClick={onClick}>
      {/* checkbox for selecting the card */}
      {onSelect && (
        <input
          type="checkbox"
          checked={!!selected}
          onChange={e => { e.stopPropagation(); onSelect(recipe, e.target.checked); }}
          style={{ position: 'absolute', top: 10, left: 10, zIndex: 3, width: 22, height: 22 }}
        />
      )}
      {/* save button */}
      {onSave && (
        <button
          className="save-recipe-btn"
          style={{ position: 'absolute', top: 10, right: 10, background: '#4caf50', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 15, padding: '0.3rem 1rem', cursor: 'pointer', zIndex: 2 }}
          onClick={e => { e.stopPropagation(); onSave(recipe); }}
        >
          Save
        </button>
      )}
      {/* delete button */}
      {onDelete && (
        <button
          className="delete-recipe-btn"
          style={{ position: 'absolute', top: 10, right: 10, background: '#e57373', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 700, fontSize: 15, padding: '0.3rem 1rem', cursor: 'pointer', zIndex: 2 }}
          onClick={e => { e.stopPropagation(); onDelete(recipe); }}
        >
          ×
        </button>
      )}
      {/* recipe image */}
      <CardMedia
        component="img"
        height="140"
        image={imageUrlFinal}
        alt={title}
        sx={{ objectFit: 'cover', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}
      />
      {/* recipe content */}
      <CardContent>
        <Typography gutterBottom variant="h6" component="div" style={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          cooking time: {time} minutes<br />
          servings: {servings}
        </Typography>
      </CardContent>
    </Card>
  );
}
