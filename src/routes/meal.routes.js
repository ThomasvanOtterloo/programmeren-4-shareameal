const  express = require('express');
const mealRouter = express.Router();
const authController = require('../controllers/auth.controller')
const mealController = require('../controllers/meal.controller')
const logger = require('tracer').console()

mealRouter.get("/api/meal/:id", mealController.validateID, mealController.getMeal);

mealRouter.get("/api/meal", mealController.getAll);

mealRouter.post("/api/meal", authController.validateToken,mealController.validateMeal, mealController.addMeal);

mealRouter.put("/api/meal/:id", authController.validateToken,mealController.validateID, mealController.validateSecurity, mealController.validateMeal, mealController.updateMeal);

mealRouter.delete("/api/meal/:id", authController.validateToken, mealController.validateID, mealController.validateSecurity, mealController.deleteMeal);

module.exports = mealRouter;
