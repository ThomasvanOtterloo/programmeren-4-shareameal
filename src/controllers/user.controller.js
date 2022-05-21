
const assert = require('assert');
const dbConnection = require('../../database/dbconnection')
const {logger} = require("../config/config");
const {log} = require("nodemon/lib/utils");
const jwt = require('jsonwebtoken')

let controller = {

    validateUser:(req,res,next)=>{
        let user = req.body;
        let {firstName, lastName, street, city, password, emailAddress} = user;
        try {
            assert(typeof firstName === 'string','firstName must be a string')
            assert(typeof lastName === 'string','LastName must be a string')
            assert(typeof emailAddress === 'string','EmailAddress must be a string')
            assert(typeof password === 'string','Password must be a string')
            assert(typeof street === 'string','Street must be a string')
            assert(typeof city === 'string','City must be a string')

            next();
        }
        catch (err){
            const error = {
                status: 400,
                result: err.message,
            }
            next(error);
        }
    },

    regexExpLogin: (req,res,next) => {
        let email = req.body.emailAddress;
        let password = req.body.password;
        let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
        let passwordRegex = new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')

        // Qwerty@123
        if (regex.test(email) && passwordRegex.test(password)) {
            logger.debug(regex.test(email), email)
            next()
        } else {
            if (!regex.test(email)) {
                logger.debug(regex.test(email), email)
                res.status(400).json({
                    status: 400,
                    error: 'Email is not valid. Please try not to use any abnormal characters that do not belong in a mail.'
                })
            } else if (!passwordRegex.test(password)) {
                logger.debug(passwordRegex.test(password),password);
                res.status(400).json({
                    status: 400,
                    error: 'password is not valid. Minimum eight characters, at least one uppercase letter, one lowercase letter and one number.'
                })
            }
        }
    },


    regexExpression: (req,res,next) => {
        let email = req.body.emailAddress;
        let password = req.body.password;
        let number = req.body.phoneNumber;
        let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
        let passwordRegex = new RegExp('^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$')
        const phoneNumber = new RegExp('^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$');

        logger.debug(phoneNumber.test(number), number)

        // Qwerty@123
        if (regex.test(email) && passwordRegex.test(password) && phoneNumber.test(number) ) {
            logger.debug(regex.test(email), email)
            next()
        } else {
            if (!regex.test(email)) {
                logger.debug(regex.test(email), email)
                res.status(400).json({
                    status: 400,
                    error: 'Email is not valid. Please try not to use any abnormal characters that do not belong in a mail.'
                })
            } else if (!passwordRegex.test(password)) {
                logger.debug(passwordRegex.test(password),password);
                res.status(400).json({
                    status: 400,
                    error: 'password is not valid. Minimum eight characters, at least one uppercase letter, one lowercase letter and one number.'
                })
            } else if (!phoneNumber.test(number)) {
                logger.debug(phoneNumber.test(number),number);
                res.status(400).json({
                    status: 400,
                    error: 'Number is not valid.'
                })
            }
        }

    },

    validateEmailaddress:(req,res,next)=>{
        let email = req.body.emailAddress;
        let id = req.params.id;
        let query;
        if (id === undefined) {
            query = `SELECT * FROM user WHERE emailAdress = '${email}'`
        } else {
            query = `SELECT * FROM user WHERE emailAdress = '${email}' AND NOT id = ${id}`
        }
            dbConnection.getConnection(function (err, connection) {
                if (err)
                    return res.status(400).JSON({
                        Status: 400,
                        error: err
                    })
                connection.query(query, function (error,results,fields) {
                    connection.release()
                    if (results.length > 0) {
                        res.status(409).json({
                            status:409,
                            result: `Email ${email} already exists in the database, please choose a different email.`
                        })
                    } else {
                        next()
                    }
                })
            })
    },

    addUser: (req, res,next ) => {
        let user = req.body;
        let {firstName, lastName, isActive, emailAddress, password, phoneNumber, roles, street, city} = user;

        dbConnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            connection.query(`INSERT INTO user (firstName, lastName, emailAdress, password,phoneNumber ,street,city) VALUES ('${firstName}', '${lastName}', '${emailAddress}', '${password}',${phoneNumber} ,'${street}', '${city}')`,function (error, results, fields) {
            connection.query(`SELECT * FROM user WHERE emailAdress = '${emailAddress}'`, function (error, results, fields) {
                res.status(201).json({
                    status: 201,
                    result: results
                })
                if (error) throw error;
            })
                connection.release();
                if (error) throw error;
            })
        })
    },

    getAll: (req,res,next) => {
        dbConnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            let firstName = req.query.firstName;
            let lastName = req.query.lastName;
            let isActive = req.query.isActive;
            let showUsers = req.query.showUsers;
            logger.debug(firstName,lastName,isActive,showUsers)
            if (firstName !== undefined && showUsers !== undefined) {
                query = `SELECT * FROM user WHERE firstName = '${firstName}' LIMIT ${parseInt(showUsers)};`
            } else if (firstName !== undefined && lastName !== undefined) {
                query = `SELECT * FROM user WHERE firstName = '${firstName}' AND lastName = '${lastName}'`
            } else if (firstName !== undefined) {
                query = `SELECT * FROM user WHERE firstName = '${firstName}'`
            } else if (lastName !== undefined) {
                query = `SELECT * FROM user WHERE lastName = '${lastName}'`
            } else if (isActive !== undefined) {
                query = `SELECT * FROM user WHERE isActive = '${isActive}'`
            } else if (showUsers !==undefined){
                query = `SELECT * FROM user LIMIT ${parseInt(showUsers)};`
            } else {
                query = `SELECT * FROM user;`
            }

            // Use the connection
            connection.query(query,function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
                logger.debug(query)

                // Handle error after the release.
                if (error) throw error;

                // Don't use the connection here, it has been returned to the pool.
                res.status(200).json({
                    status: 200,
                    result: results
                })
            });
        });
    },

    getUser: (req, res,next) => {
        let id = req.params.id;
        dbConnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query(`SELECT * FROM user WHERE id = ${parseInt(id)}`,function (error, results, fields) {
                connection.query(`SELECT * FROM meal WHERE cookId = ${parseInt(id)}`, function (error, resultsMeal) {

                    connection.release();

                    if (error) throw error;

                    res.status(200).json({
                        status: 200,
                        result: results,
                        created_meals: resultsMeal
                    })
                });
            });
        });
    },

    updateUser: (req,res,next) => {
        let id = req.params.id;
        let user = req.body;
        let {firstName, lastName, isActive, emailAddress, password, phoneNumber, roles, street, city} = user;
        let existingMail = false;

        // Checks if the mail input is the same as the mail that's already in the database. If yes boolean is yes. if not it continues.
        dbConnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query(`SELECT * FROM user WHERE id = ${parseInt(id)} AND emailAdress = '${emailAddress}'`,function (error, results, fields) {
                connection.release();
                if (results.length === 1) {
                    existingMail = true;
                    logger.debug('mail found')
                }
                if (error) throw error;
            });
        });


        if (existingMail === true) {
            dbConnection.getConnection(function (err, connection) {
                if (err) throw err; // not connected!

                // Use the connection
                connection.query(`UPDATE user SET firstName = '${firstName}',
                                lastName = '${lastName}',
                                isActive = ${parseInt(isActive)},
                                password = '${password}',
                                phoneNumber = '${phoneNumber}',
                                roles = '${roles}', street = '${street}',
                                city = '${city}' 
                                WHERE id = ${id} ;`,
                    function (error, results, fields) {
                        connection.query(`SELECT * FROM user WHERE emailAdress = '${emailAddress}'`, function (error, results, fields) {
                            res.status(200).json({
                                status: 200,
                                result: results
                            })
                            if (error) throw error;
                        })
                        connection.release();
                        if (error) throw error;
                    });
            });

        } else {
            dbConnection.getConnection(function (err, connection) {
                if (err) throw err; // not connected!


                // Use the connection
                connection.query(`UPDATE user SET firstName = '${firstName}',
                                lastName = '${lastName}',
                                isActive = ${parseInt(isActive)},
                                emailAdress = '${emailAddress}',
                                password = '${password}',
                                phoneNumber = '${phoneNumber}',
                                roles = '${roles}', street = '${street}',
                                city = '${city}' 
                                WHERE id = ${id} ;`,
                    function (error, results, fields) {
                        connection.query(`SELECT * FROM user WHERE emailAdress = '${emailAddress}'`, function (error, results, fields) {
                            res.status(200).json({
                                status: 200,
                                result: results
                            })
                            if (error) throw error;
                        })
                        connection.release();
                        if (error) throw error;
                    });
            });
        }
    },

    deleteUser: (req,res,next) => {
        let id = req.params.id;
        dbConnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!



            // Use the connection
            connection.query(`DELETE FROM user WHERE id = ${parseInt(id)}`,function (error, results, fields) {
                connection.release();

                if (error) throw error;

                res.status(200).json({
                    status: 200,
                    result: `ID ${id} successfully deleted from the DATABASE`
                })
            });
        });
    },
    validateID: (req, res,next)=> {
        let id = req.params.id;
        dbConnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            connection.query(`SELECT * FROM user WHERE id = ${parseInt(id)};`,function (error, results, fields) {
                connection.release();
                if (results.length === 1) {
                    next()
                } else {
                    res.status(404).json({
                        status:404,
                        result: `ID ${id} Does not exist`
                    })
                }
                if (error) throw error;
            });
        });
    },

    validateSecurity: (req,res,next)=> {
        let id = req.params.id;
        let loggedId = req.userId;
        logger.debug(id, loggedId)
        if (parseInt(id) === parseInt(loggedId)) {
            next()
        } else {
            res.status(403).json({
                status: 403,
                message: 'You are not authorized to touch this users ID'
            })
        }
    },

    getProfile(req,res,next) {
        const authHeader = req.headers.authorization
        logger.debug(authHeader)
        const id = req.userId
        logger.debug(id)

        dbConnection.getConnection(function(err, connection){
            if (err) throw err; // not connected!

            connection.query(`SELECT * FROM user WHERE id = ${parseInt(id)};`,function (error, resultProfile, fields) {
                connection.query(`SELECT * FROM meal WHERE cookId = ${parseInt(id)}`, function (error, resultMeals, fields) {


                    connection.release();

                    if (resultProfile.length === 1) {
                        res.status(200).json({
                            status: 200,
                            result: resultProfile,
                            meals: resultMeals
                        })
                    } else {
                        res.status(401).json({
                            status: 401,
                            result: `ID ${id} Does not exist, or something went wrong with generating your token.`
                        })
                    }
                    if (error) throw error;

                });
            });
        });
    }
};




module.exports = controller;