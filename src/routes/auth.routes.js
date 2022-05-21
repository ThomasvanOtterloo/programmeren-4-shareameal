const express = require('express');
const userRouter = express.Router();
const authController = require('../controllers/auth.controller')
const userController = require('../controllers/user.controller')



userRouter.post('/auth/login', authController.validateLogin, userController.regexExpLogin, authController.login, authController.validateToken);



module.exports = userRouter;
