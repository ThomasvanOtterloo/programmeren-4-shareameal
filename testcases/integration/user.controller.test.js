const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const dbConnection = require("../../database/dbconnection");
let testDatabase = {}

dbConnection.getConnection(function(err, connection) {
    if (err) throw err; // not connected!

    // Use the connection
    connection.query('SELECT *  FROM user', function (error, results, fields) {
        // When done with the connection, release it.
        connection.release();

        // Handle error after the release.
        if (error) throw error;

        testDatabase = results
    })
})

chai.should();
chai.use(chaiHttp)

describe('Manage Users ',()=>{
    describe('US-201 add user /api/user',() => {
        beforeEach((done)=> {
            done();
        })
        it.only('When a required input is missing, a valid error should be returned',(done)=> {

            chai
                .request(server)
                .post('/api/user')
                .send({
                    //firstName missing
                    // firstName: 'Thomas',
                    lastName: 'van Otterloo',
                })
                .end((err, res)=>{
                    res.should.be.an('object')
                    let {status, result} = res.body;
                    status.should.equals(400)
                    result.should.be.a('string').that.equals('firstName must be a string')
                    done();
                })
        })

        it.only('When adding a user with a certain email, but the email allready exists in the database. A valid error should be returned.',
            (done) => {
            chai.request(server).post('/api/user').send({
                emailAddress: 'm.vandullemen@server.nl'
            })
                .end((err,res) => {
                res.should.be.an('object')
                let {status, result} = res.body
                status.should.equals(400);
                result.should.be.
                done()


            })
            })
            })
    })

    describe('US-202 delete user /api/user',() => {
        beforeEach((done) => {
            done();
        })

        it.only('Deletes a user with the given ID, If the user exists it will successfully delete the user. if not, a valid error should be returned',
            (done) => {
            chai.request(server()).delete('/api/user/1').end((err,res) => {

                if(testDatabase.find(c => c.id === 1)) {
                    // res.status(200).json({
                    //     status: 200,
                    //     result: 'User successfully deleted from database'
                    // })
                } else {
                    // res.status(400).json({
                    //     status: 400,
                    //     result: 'User ID not found in database'
                    //   })
            }
            })

    })
})
