# Recipe Manager Application

A Node.js/Express.js/MongoDB application for managing and discovering recipes. The application uses the Spoonacular API to search for recipes and allows users to save their favorite recipes and create their own.

## Features

- Search for recipes using the Spoonacular API
- Save favorite recipes to MongoDB
- Create and manage your own recipes
- View recipe details and nutritional information
- Modern and responsive UI

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or a MongoDB Atlas account)
- Spoonacular API key (get one at https://spoonacular.com/food-api)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/recipe-app
   SPOONACULAR_API_KEY=your_spoonacular_api_key_here
   ```
4. Start MongoDB (if running locally)
5. Start the application:
   ```bash
   node src/app.js
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Use the search bar to find recipes
3. Click "Save Recipe" to save a recipe to your collection
4. Click "Create Recipe" to add your own recipe
5. View your saved recipes by clicking "Saved Recipes" in the navigation

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- EJS (templating)
- Spoonacular API
- Google Fonts (Poppins)
- Modern CSS (Grid, Flexbox, Variables)

## Project Structure

```
src/
├── app.js              # Main application file
├── models/
│   └── Recipe.js       # Recipe model
├── routes/
│   └── recipeRoutes.js # Recipe routes
├── views/
│   └── index.ejs       # Main view template
└── public/
    ├── css/
    │   └── style.css   # Styles
    └── js/
        └── main.js     # Client-side JavaScript
``` 