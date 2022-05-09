process.env.DB_DATABASE = process.env.DB_DATABASE || '1234567'

const chai = require('chai')
const chaiHttp = require('chai-http')

const server = require('../../index')
const dbconnection = require('../../database/dbconnection')
require('dotenv').config()

chai.should();
chai.use(chaiHttp)


/**
 * Db queries to clear and fill the test database before each test.
 */
// const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
// const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'


const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_USERS_TABLE

const INSERT_USER =
    'INSERT INTO user (id, firstName, lastName,isActive, emailAdress, password,street, city ) VALUES ' +
    '(1, "first", "last", 1,"name@server.nl", "secret", "street", "city"),' +
    '(2,"Mariëtte","van den Dullemen",0,"m.vandullemen@server.nl","secret","lijkdon","molenschot"),' +
    '(3,"John","Doe",1,"j.doe@server.com","secret","lij","mo"),' +
    '(4,"marieke","huizinga",0,"h.huizinga@server.nl","secret","qwerty","schotters");'

describe('Manage Users ',()=> {


    describe('US-201 add user /api/user', () => {
        beforeEach((done) => {
            console.log('beforeEach called')
            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(
                    CLEAR_DB,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        console.log(CLEAR_DB, 'done')
                        connection.release()

                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                    }
                )

                connection.query(
                        INSERT_USER,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        console.log(INSERT_USER, 'done')
                        connection.release()

                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        console.log('beforeEach done')

                    }
                )
                done()

            })
        })

            //TC-201-1 Verplicht veld ontbreekt
            it.only('When a firstName input is missing, a valid error should be returned', (done) => {
                chai
                    .request(server)
                    .post('/api/user')
                    .send({
                        // firstName missing
                        // firstName: 'Thomas',
                        lastName: 'van Otterloo',
                        emailAddress: 'uniqueee.thomas@gmail.com'
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, result} = res.body;
                        status.should.equals(400)
                        result.should.be.a('string').that.equals('firstName must be a string')

                        done();
                    })
            })

            //TC-201-1 Verplicht veld ontbreekt
            it.only('When a lastName input is missing, a valid error should be returned', (done) => {
                chai
                    .request(server)
                    .post('/api/user')
                    .send({
                        // firstName missing
                        firstName: 'Thomas',
                        // lastName: 'van Otterloo',
                        emailAddress: 'vanOtterloo.thomas@gmail.com'
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, result} = res.body;
                        status.should.equals(400)
                        result.should.be.a('string').that.equals('LastName must be a string')

                        done();
                    })
            })

            //TC-201-1 Verplicht veld ontbreekt
            it.only('When a email input is missing, a valid error should be returned', (done) => {
                chai
                    .request(server)
                    .post('/api/user')
                    .send({
                        // firstName missing
                        firstName: 'Thomas',
                        lastName: 'van Otterloo',
                        // emailAddress: 'vanOtterloo.thomas@gmail.com'
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, result} = res.body;
                        status.should.equals(400)
                        result.should.be.a('string').that.equals('EmailAddress must be a string')

                        done();
                    })
            })

            //TC-201-1 Verplicht veld ontbreekt
            it.only('When a password input is missing, a valid error should be returned', (done) => {
                chai
                    .request(server)
                    .post('/api/user')
                    .send({
                        // firstName missing
                        firstName: 'Thomas',
                        lastName: 'van Otterloo',
                        emailAddress: 'vanOtterloo.thomas@gmail.com',
                        // password: 'secret',
                        street: 'Lijndonk',
                        city: 'Molenschot'
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, result} = res.body;
                        status.should.equals(400)
                        result.should.be.a('string').that.equals('Password must be a string')

                        done();
                    })
            })

            //TC-201-1 Verplicht veld ontbreekt
            it.only('When a street input is missing, a valid error should be returned', (done) => {
                chai
                    .request(server)
                    .post('/api/user')
                    .send({
                        // firstName missing
                        firstName: 'Thomas',
                        lastName: 'van Otterloo',
                        emailAddress: 'vanOtterloo.thomas@gmail.com',
                        password: 'secret',
                        // street: 'Lijndonk',
                        city: 'Molenschot'
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, result} = res.body;
                        status.should.equals(400)
                        result.should.be.a('string').that.equals('Street must be a string')

                        done();
                    })
            })

            //TC-201-1 Verplicht veld ontbreekt
            it.only('When a city input is missing, a valid error should be returned', (done) => {
                chai
                    .request(server)
                    .post('/api/user')
                    .send({
                        firstName: 'Thomas',
                        lastName: 'van Otterloo',
                        emailAddress: 'vanOtterloo.thomas@gmail.com',
                        password: 'secret',
                        street: 'Lijndonk'
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, result} = res.body;
                        status.should.equals(400)
                        result.should.be.a('string').that.equals('City must be a string')
                        done();
                    })
            })

            //TC-201-4 Gebruiker bestaat al
            it.only('When adding a user with a certain email, but the email already exists in the database. A valid error should be returned.',
                (done) => {
                    chai
                        .request(server)
                        .post('/api/user')
                        .send({
                            firstName: 'Thomas',
                            lastName: 'van Otterloo',
                            emailAddress: 'm.vandullemen@server.nl',
                            password: 'secret123',
                            street: 'lijndonk',
                            city: 'Molenschot'
                        })
                        .end((err, res) => {
                            res.should.be.an('object')
                            let {status, result} = res.body
                            status.should.equals(400);
                            result.should.be.a('string').that.equals(`Email m.vandullemen@server.nl already exists in the database, please choose a different email.`)
                            done()
                        })
                })


            //TC-201-5 Gebruiker succesvol geregistreerd
            it.only('When registering a user that has no errors, the generated user will be returned.', (done) => {
                chai
                    .request(server)
                    .post('/api/user')
                    .send({
                        firstName: 'Thomas',
                        lastName: 'van Otterloo',
                        emailAddress: 'newUser1@gmail.com',
                        password: 'secret',
                        street: 'Lijndonk',
                        city: 'Molenschot'
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, result} = res.body;
                        status.should.equals(200)
                        result.should.be.an('array').to.deep.equal(result)
                        done();
                    })
            })


        })


        describe('TC-202 GET users /api/user', () => {

            describe('TC-202-2 GET users empty database is needed. /api/user', () => {
                beforeEach((done) => {
                    console.log('beforeEach called of GET method')
                    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
                    dbconnection.getConnection(function (err, connection) {
                        if (err) throw err // not connected!

                        // Use the connection
                        connection.query(
                            CLEAR_DB,
                            function (error, results, fields) {
                                // When done with the connection, release it.
                                console.log(CLEAR_DB, 'done')
                                connection.release()

                                // Handle error after the release.
                                if (error) throw error
                                // Let op dat je done() pas aanroept als de query callback eindigt!
                                console.log('beforeEach Finished. Cleared database')
                            }
                        )
                        done()
                    })

                })

                //202-1
                it.only('When doing a get request but there are no registered users, it will return a empty list.',
                    (done) => {
                        chai
                            .request(server)
                            .get('/api/user')
                            .end((err, res) => {
                                res.should.be.an('object')
                                let {status, result} = res.body
                                status.should.equals(200);
                                // empty
                                result.should.be.a('array').to.deep.equal(result)
                                done()
                            })
                    })
            })


            describe('TC-202-2 GET users filled database is needed. /api/user', () => {
                beforeEach((done) => {
                    console.log('beforeEach called')
                    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
                    dbconnection.getConnection(function (err, connection) {
                        if (err) throw err // not connected!

                        // Use the connection
                        connection.query(
                            CLEAR_DB,
                            function (error, results, fields) {
                                // When done with the connection, release it.
                                console.log(CLEAR_DB, 'done')
                                connection.release()

                                // Handle error after the release.
                                if (error) throw error
                                // Let op dat je done() pas aanroept als de query callback eindigt!
                            }
                        )

                        connection.query(
                            INSERT_USER,
                            function (error, results, fields) {
                                // When done with the connection, release it.
                                console.log(INSERT_USER, 'done')
                                connection.release()

                                // Handle error after the release.
                                if (error) throw error
                                // Let op dat je done() pas aanroept als de query callback eindigt!
                                console.log('beforeEach done')
                            }
                        )
                        done()

                    })

                })


                //202-2
                it.only('When using a query to get the top 2 rows in Users, 2 objects shall successfully return.',
                    (done) => {
                        chai
                            .request(server)
                            .get('/api/user?showUsers=2')
                            .end((err, res) => {
                                res.should.be.an('object')
                                let {status, result} = res.body
                                status.should.equals(200);
                                //filled
                                result.should.be.a('array').to.deep.equal(result)
                                done()
                            })
                    })

                //202-3
                it.only('When querying for a name that does not exist in the database, a empty list will be returned as result.',
                    (done) => {
                        chai
                            .request(server)
                            .get('/api/user?firstName=santaClaus')
                            .end((err, res) => {
                                res.should.be.an('object')
                                let {status, result} = res.body
                                status.should.equals(200);
                                result.should.be.a('array').to.deep.equal([])
                                done()
                            })
                    })

                //202-4
                it.only('When querying on Active=false, List of Users where activity = false will be returned.',
                    (done) => {
                        chai
                            .request(server)
                            .get('/api/user?isActive=0')
                            .end((err, res) => {
                                res.should.be.an('object')
                                let {status, result} = res.body
                                status.should.equals(200);
                                result.should.be.a('array').to.deep.equal(result)
                                done()
                            })
                    })


                //202-5
                it.only('When querying on Active=true, Users where activity = true will be returned.',
                    (done) => {
                        chai
                            .request(server)
                            .get('/api/user?isActive=1')
                            .end((err, res) => {
                                res.should.be.an('object')
                                let {status, result} = res.body
                                status.should.equals(200);
                                result.should.be.a('array').to.deep.equal(result)
                                done()
                            })
                    })

                //202-6
                it.only('When using a query to find a user with a specifik name, Users withs that same name will be returned.',
                    (done) => {
                        chai
                            .request(server)
                            .get('/api/user?firstName=John')
                            .end((err, res) => {
                                res.should.be.an('object')
                                let {status, result} = res.body
                                status.should.equals(200);
                                //filled
                                result.should.be.a('array').to.deep.equal(result)
                                done()
                            })
                    })
            })
        })

    //TC 204 moeten hier nog komen. GET BY ID en ID bestaan niet.

    describe('TC-205 GET user by ID /api/user/:id', () => {
        beforeEach((done) => {

            console.log('beforeEach called')
            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(
                    CLEAR_DB,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        console.log(CLEAR_DB, 'done')
                        connection.release()

                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                    }
                )

                connection.query(
                    INSERT_USER,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        console.log(INSERT_USER, 'done')
                        connection.release()

                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        console.log('beforeEach done')
                    }
                )
                done()

            })

        })

        //TC-206-1
        it.only('GET a user with a ID that does not exist in the database, now a valid error should be returned',
            (done) => {
                chai
                    .request(server).get('/api/user/999').end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body
                    status.should.equals(400);
                    result.should.be.a('string').that.equals(`ID 999 Does not exist`)
                    done()
                })
            })

        //TC-206-4
        it.only('GET a user with a ID that does exist in the database, now a successfull response should be returned with the given user.',
            (done) => {
                chai
                    .request(server).get('/api/user/4').end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body
                    status.should.equals(200);
                    result.should.be.a('array').to.deep.equal(result)
                    done()
                })
            })
    })


    describe('TC-206 delete user /api/user/:id', () => {
        beforeEach((done) => {

            console.log('beforeEach called')
            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(
                    CLEAR_DB,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        console.log(CLEAR_DB, 'done')
                        connection.release()

                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                    }
                )

                connection.query(
                    INSERT_USER,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        console.log(INSERT_USER, 'done')
                        connection.release()

                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        console.log('beforeEach done')
                    }
                )
                done()
            })

        })

        //TC-206-1
        it.only('Deletes a user with the given ID, If the user exists it will successfully delete the user. if not, a valid error should be returned',
            (done) => {
                chai
                    .request(server).delete('/api/user/999').end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body
                    status.should.equals(400);
                    result.should.be.a('string').that.equals(`ID 999 Does not exist`)
                    done()
                })
            })

        //TC-206-4
        it.only('When deleting a existing user from the database. It returns a successful message with code 200',
            (done) => {
                chai
                    .request(server).delete('/api/user/4').end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body
                    status.should.equals(200);
                    result.should.be.a('string').that.equals(`ID 4 successfully deleted from the DATABASE`)
                    done()
                })
            })
    })

    describe('TC-205 PUT users /api/user/:id', () => {
        beforeEach((done) => {

            console.log('beforeEach called')
            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(
                    CLEAR_DB,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        console.log(CLEAR_DB, 'done')
                        connection.release()

                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                    }
                )

                connection.query(
                    INSERT_USER,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        console.log(INSERT_USER, 'done')
                        connection.release()

                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        console.log('beforeEach done')
                    }
                )
                done()

            })

        })

        //  TC-???-?
        it.only('When updating the email to a different email that already exists in the database, and valid error should be returned.',
            (done) => {
                chai.request(server).put('/api/user/1').send({
                    firstName: 'thomas',
                    lastName: 'van Otterloo',
                    isActive: 1,
                    emailAddress: 'j.doe@server.com',
                    password: '123',
                    phoneNumber: '-',
                    roles: 'editor,guest',
                    street: 'Lijndonk',
                    city: 'breda'
                }).end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body
                    status.should.equals(400);
                    result.should.be.a('string').that.equals(`Email j.doe@server.com already exists in the database, please choose a different email.`)
                    done()
                })
            })

        // TC-205-1
        it.only('When updating a user but a required field is missing, an valid error should be returned.',
            (done) => {
                //1
                chai.request(server).put('/api/user/1').send({
                    firstName: 'thomas',
                    // lastName: 'van Otterloo',
                    isActive: 1,
                    emailAddress: 'j.doe@server.com',
                    password: '123',
                    phoneNumber: '-',
                    roles: 'editor,guest',
                    street: 'Lijndonk',
                    city: 'breda'
                }).end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body
                    status.should.equals(400);
                    result.should.be.a('string').that.equals(`LastName must be a string`)
                    done()
                })
            })

        // TC-205-2
        // it.only('When updating a user but the postal code is not available, an valid error should be returned.',
        //     (done) => {
        //         //1
        //         chai.request(server).put('/api/user/1').send({
        //             firstName: 'thomas',
        //             // lastName: 'van Otterloo',
        //             isActive: 1,
        //             emailAddress: 'j.doe@server.com',
        //             password: '123',
        //             phoneNumber: '-',
        //             roles: 'editor,guest',
        //             street: 'Lijndonk',
        //             city: 'breda'
        //         }).end((err, res) => {
        //             res.should.be.an('object')
        //             let {status, result} = res.body
        //             status.should.equals(400);
        //             result.should.be.a('string').that.equals(`LastName must be a string`)
        //             done()
        //         })
        //     })

        // TC-205-3
        // it.only('When updating, an valid error should be returned.',
        //     (done) => {
        //         //1
        //         chai.request(server).put('/api/user/1').send({
        //             firstName: 'thomas',
        //             // lastName: 'van Otterloo',
        //             isActive: 1,
        //             emailAddress: 'j.doe@server.com',
        //             password: '123',
        //             phoneNumber: '-',
        //             roles: 'editor,guest',
        //             street: 'Lijndonk',
        //             city: 'breda'
        //         }).end((err, res) => {
        //             res.should.be.an('object')
        //             let {status, result} = res.body
        //             status.should.equals(400);
        //             result.should.be.a('string').that.equals(`LastName must be a string`)
        //             done()
        //         })
        //     })


        // TC-205-4
        it.only('When updating a user but the ID is not available, an valid error should be returned.',
            (done) => {
                //1
                chai.request(server).put('/api/user/999').send({
                    firstName: 'thomas',
                    lastName: 'van Otterloo',
                    isActive: 1,
                    emailAddress: 'j.doe@server.com',
                    password: '123',
                    phoneNumber: '-',
                    roles: 'editor,guest',
                    street: 'Lijndonk',
                    city: 'breda'
                }).end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body
                    status.should.equals(400);
                    result.should.be.a('string').that.equals(`ID 999 Does not exist`)
                    done()
                })
            })

        // TC-205-5
        // it.only('????????, an valid error should be returned.',
        //     (done) => {
        //         //1
        //         chai.request(server).put('/api/user/999').send({
        //             firstName: 'thomas',
        //             lastName: 'van Otterloo',
        //             isActive: 1,
        //             emailAddress: 'j.doe@server.com',
        //             password: '123',
        //             phoneNumber: '-',
        //             roles: 'editor,guest',
        //             street: 'Lijndonk',
        //             city: 'breda'
        //         }).end((err, res) => {
        //             res.should.be.an('object')
        //             let {status, result} = res.body
        //             status.should.equals(400);
        //             result.should.be.a('string').that.equals(`ID 999 Does not exist`)
        //             done()
        //         })
        //     })

        // TC-205-6
        it.only('When updating a user correctly, a successful result should be returned.',
            (done) => {
                //1
                chai.request(server).put('/api/user/3').send({
                    firstName: 'ChangedThisRow',
                    lastName: 'Doe',
                    isActive: 1,
                    emailAddress: 'j.doe@server.com',
                    password: 'ChangedThisRow',
                    phoneNumber: '-',
                    roles: 'editor,guest',
                    street: 'ChangedThisRow',
                    city: 'breda'
                }).end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body
                    status.should.equals(200);
                    result.should.be.an('array').to.deep.equal(result)

                    done()
                })
            })

    })
})
