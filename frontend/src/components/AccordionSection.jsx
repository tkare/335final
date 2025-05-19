// src/components/AccordionSection.jsx
import React, { useState } from 'react';
import RecipeCard from './RecipeCard.jsx';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function AccordionSection({ title, recipes }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {recipes.length > 0 ? (
          <div className="recipe-grid">
            {recipes.map(recipe => (
              <RecipeCard key={recipe._id || recipe.id} recipe={recipe} />
            ))}
          </div>
        ) : (
          <p>No recipes found in this section.</p>
        )}
      </AccordionDetails>
    </Accordion>
  );
}