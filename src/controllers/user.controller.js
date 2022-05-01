let userList = [];
let id=0;
const assert = require('assert');
const dbConnection = require('../../database/dbconnection')

let controller = {

    validateUser:(req,res,next)=>{
        let user = req.body;
        let {firstName, lastName, street, city, password, emailAddress} = user;
        try {
            assert(typeof firstName === 'string','firstName must be a string')
            assert(typeof lastName === 'string','Name must be a string')
            assert(typeof street === 'string','Name must be a string')
            assert(typeof city === 'string','Name must be a string')
            assert(typeof password === 'string','Name must be a string')
            assert(typeof emailAddress === 'string','Name must be a string')
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

    addUser: (req, res,next ) => {
        let user = req.body;
        if (userList.find(c => c.emailAddress === req.body.emailAddress)) {
            const error = {
                status:404,
                result: "A user with this email address already exists!"
            }
            next(error);
        } else {
            id++;
            user = {
                id,
                ...user,
            };
            userList.push(user);
            res.status(201).json({
                status: 201,
                result: userList,
            });
            console.log("Succesfully POST json sent.")
        }
    },

    getAll: (req,res,next) => {

        dbConnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!

            // Use the connection
            connection.query('SELECT id, name FROM meal', function (error, results, fields) {
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
        let user = req.params.id;
        console.log(user)
        if (userList.find(c => c.id === parseInt(req.params.id))) {
            res.status(200).json({
                status: 200,
                result: userList.find(c => c.id === parseInt(req.params.id))
            });
            console.log(user + " has been pulled")
        } else {
            const error = {
                status: 400,
                result: `User with ID ${user} not found`
            }
            next(error)
        }
    },

    updateUser: (req,res,next) => {
        if(userList.find(c => c.id === parseInt(req.params.id))) {
            console.log(req.params.id)
            let user = userList.find(c => c.id === parseInt(req.params.id));
            if (user.emailAddress !== req.body.emailAddress && userList.find(c => c.emailAddress === req.body.emailAddress)) {
                res.status(400).json({status: 401, result: "You updated your mail to a mail that allready exists!"})
            } else {
                user.firstName = req.body.firstName
                user.lastName = req.body.lastName
                user.street = req.body.street
                user.city = req.body.city
                user.password = req.body.password
                user.emailAddress = req.body.emailAddress
                res.status(200).json({status: 200, result: user});
            }
        } else {
            const error = {
                status: 400,
                result: `User with this ID not found`,
            }
            next(error);
        }
    },

    deleteUser: (req,res,next) => {
        console.log(req.params)
        let user = userList.find(c => c.id === parseInt(req.params.id));
        if(user) {
            userList.splice(userList.indexOf(user),1);
            res.status(200).json({
                status:200,
                result: 'Successfully deleted.'
            })
        } else {
            const error = {
                status: 400,
                result: `User with this ID is not found`,
            }
            next(error);
        }
    }
};




module.exports = controller;