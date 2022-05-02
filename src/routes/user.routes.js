const  express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/user.controller')



userRouter.get("/", (req, res) => {
    res.status(200).json({
        status: 200,
        result: "Hello World",
    });
});

// Gets ALL User objects in the list.
userRouter.get("/api/user", userController.getAll);

// Creates a object in USER
userRouter.post('/api/user' , userController.validateUser, userController.validateEmailaddress, userController.addUser);

// Requests 1 user with a specific ID.
userRouter.get('/api/user/:id',userController.validateID, userController.getUser);

// Updates a user.
userRouter.put("/api/user/:id",userController.validateID, userController.validateEmailaddress, userController.updateUser);

// deleted a user by id
userRouter.delete('/api/user/:id',userController.validateID, userController.deleteUser);

module.exports = userRouter;
