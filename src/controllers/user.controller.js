
const assert = require('assert');
const dbConnection = require('../../database/dbconnection')

let controller = {

    validateUser:(req,res,next)=>{
        let user = req.body;
        let {firstName, lastName, street, city, password, emailAddress} = user;
        try {
            assert(typeof firstName === 'string','firstName must be a string')
            // assert(typeof lastName === 'string','Name must be a string')
            // assert(typeof street === 'string','Name must be a string')
            // assert(typeof city === 'string','Name must be a string')
            // assert(typeof password === 'string','Name must be a string')
            // assert(typeof emailAddress === 'string','Name must be a string')
            console.log('validate user confirmed')
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
                // SELECT * FROM user WHERE emailAdress = 'h.tank@server.com' AND NOT id = 5;
                connection.query(query, function (error,results,fields) {
                    connection.release()
                    console.log(results)
                    if (results.length > 0) {
                        console.log('duplication is triggered' , results.length)
                        console.log(results)
                        res.status(400).json({
                            status:400,
                            results: `Email ${email} already exists in the database, please choose a different email.`
                        })
                        console.log('validateEmailAddress confirmed')
                    } else {
                        console.log( 'Duplication not triggered > next to add user or update user')
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

            connection.query(`INSERT INTO user (firstName, lastName, emailAdress, password,street,city) VALUES ('${firstName}', '${lastName}', '${emailAddress}', '${password}', '${street}', '${city}')`,function (error, results, fields) {
            connection.query(`SELECT * FROM user WHERE emailAdress = '${emailAddress}'`, function (error, results, fields) {
                console.log(results)
                res.status(200).json({
                    status: 200,
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

            // Use the connection
            connection.query('SELECT * FROM user',function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();

                // Handle error after the release.
                if (error) throw error;

                // Don't use the connection here, it has been returned to the pool.
                console.log('#results = ', results.length)
                res.status(200).json({
                    status: 200,
                    result: results
                })
                // pool.end((err)=> {
                //     console.log('pool was closed.')
                // });
            });
        });
    },

    getUser: (req, res,next) => {
        let id = req.params.id;
        console.log(id)
        dbConnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query(`SELECT * FROM user WHERE id = ${parseInt(id)}`,function (error, results, fields) {
                connection.release();

                if (error) throw error;

                res.status(200).json({
                    status: 200,
                    result: results
                })
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
                            console.log(results)
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
                            console.log(results)
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
        console.log(id)
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
                    console.log(results);
                    res.status(400).json({
                        status:400,
                        results: `ID ${id} Does not exist`
                    })
                }
                if (error) throw error;
            });
        });
    }
};




module.exports = controller;