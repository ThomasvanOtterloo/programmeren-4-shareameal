const  express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/user.controller')
const authController = require('../controllers/auth.controller')
const logger = require('tracer').console()


userRouter.get("/", (req, res) => {
    res.status(200).json({
        status: 200,
        result: "Hello World, This is Thomas van Otterloo haha! SN:2186082",
    });
});

logger.debug('testing the debug mode')

// Creates a object in USER UC-201
userRouter.post('/api/user' , userController.validateUser,userController.regexExpression, userController.validateEmailaddress, userController.addUser);

//authcontroller.validate checkt of de gebruiker is ingelogd of niet. Wanneer er een geldig token is gaat die door. anders krijg je een error
// UC-202
userRouter.get("/api/user",authController.validateToken, userController.getAll);

// get ur own profile UC-203
userRouter.get('/api/profile', authController.validateToken, userController.getProfile)

// Requests 1 user with a specific ID. UC-204
userRouter.get('/api/user/:id',authController.validateToken,userController.validateID, userController.getUser);

// Updates a user. UC-205
userRouter.put("/api/user/:id", authController.validateToken, userController.validateID, userController.validateUser, userController.regexExpression, userController.validateEmailaddress, userController.updateUser);

// deleted a user by id UC-206
userRouter.delete('/api/user/:id',authController.validateToken, userController.validateID, userController.validateSecurity, userController.deleteUser);



module.exports = userRouter;
