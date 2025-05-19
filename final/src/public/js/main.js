document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const createRecipeForm = document.getElementById('createRecipeForm');
    const recipeForm = document.getElementById('recipeForm');
    const savedRecipesLink = document.getElementById('savedRecipes');
    const createRecipeLink = document.getElementById('createRecipe');

    // Navigation
    createRecipeLink.addEventListener('click', (e) => {
        e.preventDefault();
        createRecipeForm.classList.remove('hidden');
        searchResults.innerHTML = '';
    });

    savedRecipesLink.addEventListener('click', async (e) => {
        e.preventDefault();
        createRecipeForm.classList.add('hidden');
        await loadSavedRecipes();
    });

    // Search functionality
    searchButton.addEventListener('click', async () => {
        const query = searchInput.value.trim();
        if (query) {
            try {
                const response = await fetch(`/recipes/search?query=${encodeURIComponent(query)}`);
                const data = await response.json();
                displaySearchResults(data.results);
            } catch (error) {
                console.error('Error searching recipes:', error);
            }
        }
    });

    // Create recipe form submission
    recipeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            title: document.getElementById('title').value,
            ingredients: document.getElementById('ingredients').value.split('\n').filter(i => i.trim()),
            instructions: document.getElementById('instructions').value,
            cookingTime: parseInt(document.getElementById('cookingTime').value),
            servings: parseInt(document.getElementById('servings').value),
            source: 'user'
        };

        try {
            const response = await fetch('/recipes/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Recipe created successfully!');
                recipeForm.reset();
                createRecipeForm.classList.add('hidden');
                await loadSavedRecipes();
            } else {
                throw new Error('Failed to create recipe');
            }
        } catch (error) {
            console.error('Error creating recipe:', error);
            alert('Failed to create recipe. Please try again.');
        }
    });

    // Helper functions
    async function loadSavedRecipes() {
        try {
            const response = await fetch('/recipes/saved');
            const recipes = await response.json();
            displaySavedRecipes(recipes);
        } catch (error) {
            console.error('Error loading saved recipes:', error);
        }
    }

    function displaySearchResults(recipes) {
        searchResults.innerHTML = '';
        recipes.forEach(recipe => {
            const card = createRecipeCard(recipe);
            searchResults.appendChild(card);
        });
    }

    function displaySavedRecipes(recipes) {
        searchResults.innerHTML = '';
        recipes.forEach(recipe => {
            const card = createRecipeCard(recipe);
            searchResults.appendChild(card);
        });
    }

    function createRecipeCard(recipe) {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.style.cursor = 'pointer';
        // Determine if it's a Spoonacular or user recipe
        const isSpoonacular = recipe.id && !recipe._id;
        const recipeId = isSpoonacular ? recipe.id : recipe._id;
        const source = isSpoonacular ? 'spoonacular' : 'user';
        card.onclick = () => {
            window.location.href = `/recipes/view/${recipeId}?source=${source}`;
        };
        const cookingTime = recipe.readyInMinutes || recipe.cookingTime || 'N/A';
        const servings = recipe.servings || 'N/A';
        const content = `
            <img src="${recipe.image || recipe.imageUrl || 'https://via.placeholder.com/300x200'}" alt="${recipe.title}">
            <div class="recipe-card-content">
                <h3>${recipe.title}</h3>
                <p>Cooking Time: ${cookingTime} minutes</p>
                <p>Servings: ${servings}</p>
            </div>
        `;
        card.innerHTML = content;
        return card;
    }

    // Inventory management
    const inventoryForm = document.getElementById('inventoryForm');
    const inventoryInput = document.getElementById('inventoryInput');
    const inventoryList = document.getElementById('inventoryList');
    const findByInventoryBtn = document.getElementById('findByInventory');
    const inventoryResults = document.getElementById('inventoryResults');
    const clearInventoryBtn = document.getElementById('clearInventory');

    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    renderInventory();

    // Ingredient autocomplete
    let autocompleteList;
    let autocompleteItems = [];
    let selectedAutocompleteIdx = -1;

    inventoryInput.addEventListener('input', async function() {
        const query = this.value.trim();
        closeAutocomplete();
        if (query.length < 2) return;
        try {
            const res = await fetch(`/recipes/ingredient-autocomplete?query=${encodeURIComponent(query)}`);
            const suggestions = await res.json();
            if (!Array.isArray(suggestions) || suggestions.length === 0) return;
            autocompleteList = document.createElement('div');
            autocompleteList.className = 'inventory-autocomplete-list';
            autocompleteItems = [];
            suggestions.forEach((item, idx) => {
                const div = document.createElement('div');
                div.className = 'inventory-autocomplete-item';
                div.textContent = item.name;
                div.onclick = (e) => {
                    e.preventDefault();
                    if (item.name && !inventory.includes(item.name)) {
                        inventory.push(item.name);
                        localStorage.setItem('inventory', JSON.stringify(inventory));
                        renderInventory();
                    }
                    closeAutocomplete();
                    inventoryInput.value = '';
                    inventoryInput.blur();
                };
                autocompleteList.appendChild(div);
                autocompleteItems.push(div);
            });
            // Append to the input wrapper for correct positioning
            const wrapper = inventoryInput.closest('.inventory-input-wrapper');
            wrapper.appendChild(autocompleteList);
            selectedAutocompleteIdx = -1;
        } catch (e) {
            // ignore
        }
    });

    inventoryInput.addEventListener('keydown', function(e) {
        if (!autocompleteList) return;
        if (e.key === 'ArrowDown') {
            selectedAutocompleteIdx = Math.min(selectedAutocompleteIdx + 1, autocompleteItems.length - 1);
            updateAutocompleteActive();
            e.preventDefault();
        } else if (e.key === 'ArrowUp') {
            selectedAutocompleteIdx = Math.max(selectedAutocompleteIdx - 1, 0);
            updateAutocompleteActive();
            e.preventDefault();
        } else if (e.key === 'Enter') {
            if (selectedAutocompleteIdx >= 0 && autocompleteItems[selectedAutocompleteIdx]) {
                autocompleteItems[selectedAutocompleteIdx].click();
                e.preventDefault();
                return false;
            }
        } else if (e.key === 'Escape') {
            closeAutocomplete();
        }
    });

    document.addEventListener('mousedown', function(e) {
        if (!autocompleteList) return;
        // Only close if clicking outside both the input and the dropdown
        if (!autocompleteList.contains(e.target) && e.target !== inventoryInput) {
            closeAutocomplete();
        }
    });

    function updateAutocompleteActive() {
        autocompleteItems.forEach((item, idx) => {
            if (idx === selectedAutocompleteIdx) {
                item.classList.add('active');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('active');
            }
        });
    }

    function closeAutocomplete() {
        if (autocompleteList) {
            autocompleteList.remove();
            autocompleteList = null;
            autocompleteItems = [];
            selectedAutocompleteIdx = -1;
        }
    }

    inventoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const ingredient = inventoryInput.value.trim();
        if (ingredient && !inventory.includes(ingredient)) {
            inventory.push(ingredient);
            localStorage.setItem('inventory', JSON.stringify(inventory));
            renderInventory();
        }
        inventoryInput.value = '';
        closeAutocomplete();
    });

    function renderInventory() {
        inventoryList.innerHTML = '';
        inventory.forEach((item, idx) => {
            const chip = document.createElement('div');
            chip.className = 'inventory-chip';
            chip.textContent = item;
            const removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remove';
            removeBtn.onclick = () => {
                inventory.splice(idx, 1);
                localStorage.setItem('inventory', JSON.stringify(inventory));
                renderInventory();
            };
            chip.appendChild(removeBtn);
            inventoryList.appendChild(chip);
        });
    }

    findByInventoryBtn.addEventListener('click', async () => {
        if (inventory.length === 0) {
            alert('Add some ingredients to your inventory first!');
            return;
        }
        try {
            const response = await fetch(`/recipes/by-ingredients?ingredients=${encodeURIComponent(inventory.join(','))}`);
            const data = await response.json();
            displayInventoryResults(data);
        } catch (error) {
            console.error('Error searching by inventory:', error);
        }
    });

    function displayInventoryResults(recipes) {
        inventoryResults.innerHTML = '';
        recipes.forEach(recipe => {
            const card = createRecipeCard(recipe);
            inventoryResults.appendChild(card);
        });
    }

    clearInventoryBtn.addEventListener('click', () => {
        inventory = [];
        localStorage.setItem('inventory', JSON.stringify(inventory));
        renderInventory();
    });
});

// Save recipe function
async function saveRecipe(recipe) {
    try {
        const response = await fetch('/recipes/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: recipe.title,
                ingredients: recipe.extendedIngredients?.map(i => i.original) || recipe.ingredients,
                instructions: recipe.instructions,
                cookingTime: recipe.readyInMinutes || recipe.cookingTime,
                servings: recipe.servings,
                imageUrl: recipe.image,
                source: 'spoonacular',
                spoonacularId: recipe.id
            })
        });

        if (response.ok) {
            alert('Recipe saved successfully!');
        } else {
            throw new Error('Failed to save recipe');
        }
    } catch (error) {
        console.error('Error saving recipe:', error);
        alert('Failed to save recipe. Please try again.');
    }
} 