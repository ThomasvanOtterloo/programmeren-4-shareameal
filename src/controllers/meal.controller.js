
const assert = require('assert');
const dbConnection = require('../../database/dbconnection')
const {logger} = require("../config/config");

let controller = {



    validateMeal:(req,res,next)=>{
        let meal = req.body;
        let {name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants,price} = meal;

        try {
            assert(typeof name === 'string','name must be a string')
            assert(typeof description === 'string','description must be a string')
            assert(typeof isActive === 'boolean','isActive must be a boolean')
            assert(typeof isVega === 'boolean','isVega must be a boolean')
            assert(typeof isVegan === 'boolean','isVegan must be a boolean')
            assert(typeof isToTakeHome === 'boolean','isToTakeHome must be a boolean')
            assert(typeof imageUrl === 'string','imageUrl must be a string')
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

    addMeal: (req, res ) => {
        let user = req.body;
        let userID = req.userId;
        logger.debug(userID)
        let {name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants,price} = user;

        dbConnection.getConnection(function (err, connection) {
            if (err) throw err; // not connected!

            connection.query(`INSERT INTO meal 
                            (cookId,name,description,isActive,isVega,isVegan,isToTakeHome,dateTime,imageUrl,allergenes,maxAmountOfParticipants,price)
                            VALUES ('${parseInt(userID)}', '${name}', '${description}', ${isActive}, ${isVega}, ${isVegan}, ${isToTakeHome}, dateTime, '${imageUrl}', '${allergenes}', '${parseInt(maxAmountOfParticipants)}', '${parseInt(price)}')
                            `,function (error, results, fields) {
                if (error) throw error;
                logger.debug(results)
                connection.query(`SELECT * FROM meal WHERE id = ${results.insertId}`, function (error,results) {
                    logger.info(results)
                    if (error) throw error;
                    connection.release();
                    res.status(201).json({
                        status: 201,
                        result: results
                    })
                })


            })
        })
    },

    getAll: (req,res,next) => {
        dbConnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!


            let maxAmountOfParticipants = req.query.maxAmountOfParticipants;
            let isVega = req.query.isVega;
            let isActive = req.query.isActive;
            let showMeals = req.query.showMeals
            if (maxAmountOfParticipants !== undefined && isActive !== undefined) {
                query = `SELECT * FROM meal WHERE maxAmountOfParticipants = '${parseInt(maxAmountOfParticipants)}' AND isActive = ${parseInt(isActive)}`
            } else if (showMeals !== undefined && isVega !== undefined) {
                query = `SELECT * FROM meal WHERE isVega = '${parseInt(isVega)}' LIMIT ${parseInt(showMeals)}`
                logger.debug(query)
            } else if (maxAmountOfParticipants !== undefined) {
                query = `SELECT * FROM meal WHERE maxAmountOfParticipants = '${parseInt(maxAmountOfParticipants)}'`
            } else if (isVega !== undefined) {
                query = `SELECT * FROM meal WHERE isActive = '${parseInt(isVega)}'`
            } else if (isActive !== undefined) {
                query = `SELECT * FROM meal WHERE isActive = '${isActive}'`
            } else if (showMeals !==undefined){
                query = `SELECT * FROM meal LIMIT ${parseInt(showMeals)};`
            } else {
                query = `SELECT * FROM meal;`
            }

            // Use the connection
            connection.query(query,function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();

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

    getMeal: (req, res) => {
        let id = req.params.id;
        dbConnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query(`SELECT * FROM meal WHERE id = ${parseInt(id)}`,function (error, results, fields) {
                connection.release();

                if (error) throw error;

                res.status(200).json({
                    status: 200,
                    result: results
                })
            });
        });
    },

    updateMeal: (req,res,next) => {
        let id = req.params.id;
        let user = req.body;
        let {name, description, isActive, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants,price} = user;

        dbConnection.getConnection(function (err, connection) {
                if (err) throw err; // not connected!

                // Use the connection
                connection.query(`UPDATE meal SET name = '${name}',
                                description = '${description}',
                                isActive = ${isActive},
                                isVega = ${isVega},
                                isVegan = ${isVegan},
                                isToTakeHome = ${isToTakeHome}, dateTime = dateTime,
                                imageUrl = '${imageUrl}',
                                allergenes = '${allergenes}',
                                maxAmountOfParticipants = '${parseInt(maxAmountOfParticipants)}',
                                price = '${parseInt(price)}' 
                                WHERE id = ${id} ;`,
                    function (error, results, fields) {
                        connection.query(`SELECT * FROM meal WHERE id = '${id}'`, function (error, results, fields) {
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
    },

    deleteMeal: (req,res,next) => {
        let id = req.params.id;
        dbConnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!



            // Use the connection
            connection.query(`DELETE FROM meal WHERE id = ${parseInt(id)}`,function (error, results, fields) {
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

            connection.query(`SELECT * FROM meal WHERE id = ${parseInt(id)};`,function (error, results, fields) {
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
        dbConnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            connection.query(`SELECT * FROM meal WHERE id = ${parseInt(id)};`,function (error, results, fields) {
                connection.release();
                let userId = req.userId;
                let cookId = results[0].cookId;
                logger.debug(cookId, userId)

                if (cookId === userId) {
                    next();
                } else {
                    res.status(403).json({
                        status:403,
                        result: ` Your User ID does not match with the User ID of the creator of this object. You can not edit or delete other peoples products`
                    })
                }
                if (error) throw error;
            });
        });
    }
};




module.exports = controller;