process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'
// 1234567 of share-a-meal-testdb local normal db
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const dbconnection = require('../../database/dbconnection')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const { jwtSecretKey, logger } = require('../../src/config/config')
const assert = require('assert')

chai.should();
chai.use(chaiHttp)


const CLEAR_DB = 'DELETE IGNORE FROM `meal`; DELETE IGNORE FROM `meal_participants_user`; DELETE IGNORE FROM `user`;'

const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "Qwerty@123", "street", "city"), (2, "thomas", "van Otterloo", "thomas@server.nl", "Qwerty@123", "street", "city");'

/**
 * Query om twee meals toe te voegen. Let op de UserId, die moet matchen
 * met de user die je ook toevoegt.
 */
const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"


describe('Manage Users ',()=> {

    describe('UC101 Login TC-101-1 t/m 5',() =>{
        // TC-101-1
        it.only('When theres a missing field. A valid error should be returned.',
            (done) => {
                chai
                    .request(server)
                    .post('/api/auth/login')
                    .send({
                        emailAddress: 'name@server.nl'
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {error, datetime} = res.body
                        error.should.equals("AssertionError [ERR_ASSERTION]: password must be a string.");
                        datetime.should.be.a('string').that.equals(datetime)
                        done()
                    })
            })

        // TC-101-2
        it.only('When entering a invalid email. A valid error should be returned.',
            (done) => {
                chai
                    .request(server)
                    .post('/api/auth/login')
                    .send({
                        emailAddress: 'nameserver.nl',
                        password: "Qwerty@123"
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, error} = res.body
                        status.should.equals(400);
                        error.should.be.a('string').that.equals(`Email is not valid. Please try not to use any abnormal characters that do not belong in a mail.`)
                        done()
                    })
            })


        // TC-101-3
        it.only('When entering a invalid password. A valid error should be returned.',
            (done) => {
                chai
                    .request(server)
                    .post('/api/auth/login')
                    .send({
                        emailAddress: 'name@server.nl',
                        password: "Qwerty123"
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, error} = res.body
                        status.should.equals(400);
                        error.should.be.a('string').that.equals(`password is not valid. Minimum eight characters, at least one uppercase letter, one lowercase letter and one number.`)
                        done()
                    })
            })



        // TC-101-4
        it.only('When entering a valid user but it does not exist. A valid error should be returned.',
            (done) => {
                chai
                    .request(server)
                    .post('/api/auth/login')
                    .send({
                        emailAddress: 'nameThatDoesNotExist@server.nl',
                        password: "Qwerty@123"
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {message, datetime} = res.body
                        message.should.equals("User not found or password invalid");
                        datetime.should.be.a('string').that.equals(datetime)
                        done()
                    })
            })


        beforeEach((done) => {
            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        connection.release()

                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        done()
                    }
                )
            })
        })


        // TC-101-5
        it.only('When entering a valid user. A successful result should return with a token.',
            (done) => {
                chai
                    .request(server)
                    .post('/api/auth/login')
                    .send({
                        emailAddress: "thomas@server.nl",
                        password: "Qwerty@123"
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, result} = res.body;
                        status.should.equals(200);
                        result.should.be.a("object").that.contains({
                            id: result.id,
                            emailAdress: "thomas@server.nl",
                            firstName: "thomas",
                            lastName: "van Otterloo",
                            token: result.token,
                        });
                        done()
                    })
            })

    })

    describe('US-201 add user /api/user', () => {
        beforeEach((done) => {
            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        connection.release()

                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        done()
                    }
                )



            })
        })

            //TC-201-1 Verplicht veld ontbreekt
            it.only('When a firstName input is missing, a valid error should be returned', (done) => {
                chai
                    .request(server)
                    .post('/api/user')
                    .send({
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
                        firstName: 'Thomas',
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
                        firstName: 'Thomas',
                        lastName: 'van Otterloo'
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
                        firstName: 'Thomas',
                        lastName: 'van Otterloo',
                        emailAddress: 'vanOtterloo.thomas@gmail.com',
                        password: 'secret',
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

        //TC-201-2 niet-valide email
        it.only('When adding a user with a incorrect mail. A valid error should be returned.',
            (done) => {
                chai
                    .request(server)
                    .post('/api/user')
                    .send({
                        firstName: 'Thomas',
                        lastName: 'van Otterloo',
                        emailAddress: 'nameserver.nl',
                        password: 'Qwerty@123',
                        street: 'lijndonk',
                        city: 'Molenschot'
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, error} = res.body
                        status.should.equals(400);
                        error.should.be.a('string').that.equals(`Email is not valid. Please try not to use any abnormal characters that do not belong in a mail.`)
                        done()
                    })
            })

        //TC-201-3 niet-valide password
        it.only('When adding a user with a incorrect mail. A valid error should be returned.',
            (done) => {
                chai
                    .request(server)
                    .post('/api/user')
                    .send({
                        firstName: 'Thomas',
                        lastName: 'van Otterloo',
                        emailAddress: 'name@server.nl',
                        password: 'Qwerty',
                        street: 'lijndonk',
                        city: 'Molenschot'
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, error} = res.body
                        status.should.equals(400);
                        error.should.be.a('string').that.equals(`password is not valid. Minimum eight characters, at least one uppercase letter, one lowercase letter and one number.`)
                        done()
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
                            emailAddress: 'name@server.nl',
                            password: 'Qwerty@123',
                            phoneNumber: '1234512345',
                            street: 'lijndonk',
                            city: 'Molenschot'
                        })
                        .end((err, res) => {
                            res.should.be.an('object')
                            let {status, result} = res.body
                            status.should.equals(409);
                            result.should.be.a('string').that.equals(`Email name@server.nl already exists in the database, please choose a different email.`)
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
                        password: 'Qwerty@123',
                        phoneNumber: '1234512345',
                        street: 'Lijndonk',
                        city: 'Molenschot'
                    })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, result} = res.body;
                        status.should.equals(201)
                        result.should.be.an('array').to.deep.equal(result)
                        done();
                    })
            })


        })

    describe('TC-202 GET users /api/user', () => {
            describe('TC-202-2 GET users empty database is needed. /api/user', () => {
                beforeEach((done) => {
                    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
                    dbconnection.getConnection(function (err, connection) {
                        if (err) throw err // not connected!

                        // Use the connection
                        connection.query(
                            CLEAR_DB,
                            function (error, results, fields) {
                                // When done with the connection, release it.
                                connection.release()

                                // Handle error after the release.
                                if (error) throw error
                                // Let op dat je done() pas aanroept als de query callback eindigt!
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
                            .set(
                                'authorization',
                                'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey)
                            )
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
                    // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
                    dbconnection.getConnection(function (err, connection) {
                        if (err) throw err // not connected!

                        // Use the connection
                        connection.query(
                            CLEAR_DB + INSERT_USER,
                            function (error, results, fields) {
                                // When done with the connection, release it.
                                connection.release()

                                // Handle error after the release.
                                if (error) throw error
                                // Let op dat je done() pas aanroept als de query callback eindigt!
                                done()
                            }
                        )

                    })

                })


                //202-2
                it.only('When using a query to get the top 2 rows in Users, 2 objects shall successfully return.',
                    (done) => {
                        chai
                            .request(server)
                            .get('/api/user?showUsers=2')
                            .set(
                                'authorization',
                                'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey)
                            )
                            .end((err, res) => {
                                res.should.be.an('object')
                                let {status, result} = res.body
                                status.should.equals(200);
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
                            .set(
                                'authorization',
                                'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey)
                            )
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
                            .set(
                                'authorization',
                                'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey)
                            )
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
                            .set(
                                'authorization',
                                'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey)
                            )
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
                            .get('/api/user?firstName=first&lastName=last')
                            .set(
                                'authorization',
                                'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey)
                            )
                            .end((err, res) => {
                                res.should.be.an('object')
                                let {status, result} = res.body
                                status.should.equals(200);
                                result.should.be.a('array').to.deep.equal(result)
                                console.log(result)
                                done()
                            })
                    })
            })
        })

    describe('TC-203 Requesting ur own profile',()=> {
        //203-1 ongeldige token
        it.only('When trying to recieve ur own profile, but ur not even logged in with a valid token, a valid error should get returned.',
            (done) => {
                chai
                    .request(server)
                    .get('/api/profile')
                    .set(
                        'authorization',
                        'Bearer ' + jwt.sign({ id: 1 }, 'ongeldigeToken')
                    )
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, error, datetime} = res.body
                        status.should.equals(401)
                        error.should.equals('Not authorized');
                        datetime.should.be.a('string').to.deep.equal(datetime)
                        done()
                    })
            })

        //203-2 geldige token en gebruiker bestaat
        it.only('When trying to recieve ur own profile, and ur logged in, a valid response should be returned.',
            (done) => {
                chai
                    .request(server)
                    .get('/api/profile')
                    .set(
                        'authorization',
                        'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
                    )
                    .end((err, res) => {
                        assert.ifError(err)
                        res.should.be.an('object')
                        let {status, result, meals} = res.body
                        status.should.equals(200)
                        result.should.equals(result);
                        meals.should.be.a('array').to.deep.equal(meals)
                        done()
                    })
            })
    })

    describe('TC-204 details of users', () => {

        //204-1
        it.only('When requesting for a user, but having a Invalid token or not logged in, a valid error should be returned.',
            (done) => {
                chai
                    .request(server)
                    .get('/api/user/2')
                    .set(
                        'authorization',
                        'Bearer ' + jwt.sign({ id: 1 }, 'ongeldigeTokenHAHA!')
                    )
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, error, datetime} = res.body
                        status.should.equals(401)
                        error.should.equals('Not authorized');
                        datetime.should.be.a('string').to.deep.equal(datetime)
                        done()
                    })
            })


        //204-2
        it.only('When requesting for a user, but the user id does not exist, a valid error should be returned.',
            (done) => {
                chai
                    .request(server)
                    .get('/api/user/9999')
                    .set(
                        'authorization',
                        'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey)
                    )
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, result} = res.body
                        status.should.equals(404);
                        result.should.be.a('string').that.equals(`ID 9999 Does not exist`)
                        done()
                    })
            })

        //204-3
        it.only('When requesting for a user and it exists, a successful result should be returned with his information',
            (done) => {
                chai
                    .request(server)
                    .get('/api/user/2')
                    .set(
                        'authorization',
                        'Bearer ' + jwt.sign({ id: 1 }, jwtSecretKey)
                    )
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, result, created_meals} = res.body
                        status.should.equals(200);
                        result.should.be.a('array').to.deep.equal(result)
                        created_meals.should.be.a('array').to.deep.equal(created_meals)
                        done()
                    })
            })

    })

    describe('TC-205 PUT users /api/user/:id', () => {
        beforeEach((done) => {

            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        connection.release()

                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        done()
                    }
                )
            })

        })

        //  TC-???-?
        it.only('When updating the email to a different email that already exists in the database, and valid error should be returned.',
            (done) => {
                chai.request(server).put('/api/user/1').send({
                    firstName: 'first',
                    lastName: 'last',
                    isActive: 1,
                    emailAddress: 'thomas@server.nl',
                    password: 'Qwerty@123',
                    phoneNumber: '1234512345',
                    roles: 'editor,guest',
                    street: 'Lijndonk',
                    city: 'breda'
                })
                    .set(
                        'authorization',
                        'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
                    )
                    .end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body
                    status.should.equals(409);
                    result.should.be.a('string').that.equals(`Email thomas@server.nl already exists in the database, please choose a different email.`)
                    done()
                })
            })

        // TC-205-1
        it.only('When updating a user but a mail address field is missing, an valid error should be returned.',
            (done) => {
                //1
                chai.request(server).put('/api/user/1').send({
                    firstName: 'thomas',
                    lastName: 'van Otterloo',
                    isActive: 1,
                    password: '123',
                    phoneNumber: '-',
                    roles: 'editor,guest',
                    street: 'Lijndonk',
                    city: 'breda'
                })
                    .set(
                        'authorization',
                        'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
                    )
                    .end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body
                    status.should.equals(400);
                    result.should.be.a('string').that.equals(`EmailAddress must be a string`)
                    done()
                })
            })

        // TC-205-3
        it.only('When updating a user but the phone number is not valid, an valid error should be returned.',
            (done) => {
                //1
                chai.request(server).put('/api/user/1').send({
                    firstName: 'thomas',
                    lastName: 'van Otterloo',
                    isActive: 1,
                    emailAddress: 'j.doe@server.com',
                    password: 'Qwerty@123',
                    phoneNumber: 'hahaThisIsNotAnNumberAtAll!',
                    roles: 'editor,guest',
                    street: 'Lijndonk',
                    city: 'breda'
                }).set(
                    'authorization',
                    'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
                )
                    .end((err, res) => {
                    res.should.be.an('object')
                    let {status, error} = res.body
                    status.should.equals(400);
                    error.should.be.a('string').that.equals(`Number is not valid.`)
                    done()
                })
            })

        // TC-205-4
        it.only('When updating a user but the ID does not exist, an valid error should be returned.',
            (done) => {
                //1
                chai.request(server).put('/api/user/999').send({
                    firstName: 'thomas',
                    lastName: 'van Otterloo',
                    isActive: 1,
                    emailAddress: 'j.doe@server.com',
                    password: 'Qwerty@123',
                    phoneNumber: '1234512345!',
                    roles: 'editor,guest',
                    street: 'Lijndonk',
                    city: 'breda'
                }).set(
                    'authorization',
                    'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
                )
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, result} = res.body
                        status.should.equals(404);
                        result.should.be.a('string').that.equals(`ID 999 Does not exist`)
                        done()
                    })
            })


        // TC-205-5
        it.only('When updating a user but you are not even logged in, an valid error should be returned.',
            (done) => {
                //1
                chai.request(server).put('/api/user/1').send({
                    firstName: 'thomas',
                    lastName: 'van Otterloo',
                    isActive: 1,
                    emailAddress: 'j.doe@server.com',
                    password: 'Qwerty@123',
                    phoneNumber: 'hahaThisIsNotAnNumberAtAll!',
                    roles: 'editor,guest',
                    street: 'Lijndonk',
                    city: 'breda'
                })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {error, datetime} = res.body
                        error.should.equals(error);
                        datetime.should.be.a('string').that.equals(datetime)
                        done()
                    })
            })


        // TC-205-6
        it.only('When updating a user and the ID does exist, an valid response should be returned.',
            (done) => {
                //1
                chai.request(server).put('/api/user/1').send({
                    firstName: 'first',
                    lastName: 'last edited',
                    isActive: 1,
                    emailAddress: 'name@server.nl',
                    password: 'Qwerty@123',
                    phoneNumber: '1234512345',
                    roles: 'editor,guest',
                    street: 'Lijndonk',
                    city: 'breda'
                }).set(
                    'authorization',
                    'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
                )
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, result} = res.body
                        status.should.equals(200);
                        result.should.be.a('array').to.deep.equals(result)
                        done()
                    })
            })


    })

    describe('TC-206 delete user /api/user/:id', () => {
        beforeEach((done) => {

            // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
            dbconnection.getConnection(function (err, connection) {
                if (err) throw err // not connected!

                // Use the connection
                connection.query(
                    CLEAR_DB + INSERT_USER,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        connection.release()

                        // Handle error after the release.
                        if (error) throw error
                        // Let op dat je done() pas aanroept als de query callback eindigt!
                        done()
                    }
                )
            })

        })

        //TC-206-1
        it.only('Deletes a user with the given ID, If the user exists it will successfully delete the user. if not, a valid error should be returned',
            (done) => {
                chai
                    .request(server).delete('/api/user/999')
                    .set(
                        'authorization',
                        'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
                    )
                    .end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body
                    status.should.equals(404);
                    result.should.be.a('string').that.equals(`ID 999 Does not exist`)
                    done()
                })
            })

        //TC-206-2
        it.only('Deletes a user with the given ID, but is not logged in, a valid error should be returned',
            (done) => {
                chai
                    .request(server).delete('/api/user/1')
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {error, datetime} = res.body
                        error.should.equals(error);
                        datetime.should.be.a('string').that.equals(datetime)
                        done()
                    })
            })

        //TC-206-3
        it.only('Deletes a user with the given ID, but it is not his property, a valid error should be returned',
            (done) => {
                chai
                    .request(server).delete('/api/user/2')
                    .set(
                        'authorization',
                        'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
                    )
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, message} = res.body
                        status.should.equals(403);
                        message.should.be.a('string').that.equals('You are not authorized to touch this users ID')
                        done()
                    })
            })

        //TC-206-4
        it.only('When deleting a existing user from the database. It returns a successful message with code 200',
            (done) => {
                chai
                    .request(server).delete('/api/user/1')
                    .set(
                        'authorization',
                        'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
                    )
                    .end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body
                    status.should.equals(200);
                    result.should.be.a('string').that.equals(`ID 1 successfully deleted from the DATABASE`)
                    done()
                })
            })
    })

})

describe('Manage Meals', ()=>{

    beforeEach((done) => {
        // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err // not connected!

            // Use the connection
            connection.query(
                CLEAR_DB + INSERT_USER + INSERT_MEALS,
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release()

                    // Handle error after the release.
                    if (error) throw error
                    // Let op dat je done() pas aanroept als de query callback eindigt!
                    done()
                }
            )



        })
    })

    describe('TC-301 Create meals',() =>{
        //TC-301-1
        it.only('When creating a meal, but a field name is missing, a valid error should be returned',
            (done) => {
                chai
                    .request(server).post('/api/meal').send({
                    description: "Dé pastaklassieker bij uitstek.",
                    isActive: false,
                    isVega: false,
                    isVegan: true,
                    isToTakeHome: true,
                    dateTime: "2023-05-15T03:11:34.865Z",
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    allergenes: [
                        "gluten",
                        "noten",
                        "lactose"
                    ],
                    maxAmountOfParticipants: 6,
                    price: 6.75
                })
                    .set(
                        'authorization',
                        'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
                    )
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, result} = res.body
                        status.should.equals(400);
                        result.should.be.a('string').that.equals(`name must be a string`)
                        done()
                    })
            })

        //TC-301-2
        it.only('When creating a meal, but is not logged in, a valid error should be returned',
            (done) => {
                chai
                    .request(server).post('/api/meal').send({
                    name: "spaget",
                    description: "Dé pastaklassieker bij uitstek.",
                    isActive: false,
                    isVega: false,
                    isVegan: true,
                    isToTakeHome: true,
                    dateTime: "2023-05-15T03:11:34.865Z",
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    allergenes: [
                        "gluten",
                        "noten",
                        "lactose"
                    ],
                    maxAmountOfParticipants: 6,
                    price: 6.75
                })
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status, error, datetime} = res.body
                        status.should.equals(401)
                        error.should.equals(error);
                        datetime.should.be.a('string').that.equals(datetime)
                        done()
                    })
            })

        //TC-301-3
        it.only('When creating a meal, and user is logged in, a successful response with a object should be returned',
            (done) => {
                chai
                    .request(server).post('/api/meal').send({
                    name: "spaget",
                    description: "Dé pastaklassieker bij uitstek.",
                    isActive: true,
                    isVega: true,
                    isVegan: true,
                    isToTakeHome: true,
                    dateTime: "2023-05-15T03:11:34.865Z",
                    imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    allergenes: [
                        "gluten",
                        "noten",
                        "lactose"
                    ],
                    maxAmountOfParticipants: 6,
                    price: 6.75
                }).set(
                    'authorization',
                    'Bearer ' + jwt.sign({ userId: 2 }, jwtSecretKey)
                ).end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body
                    status.should.equals(201);
                    result.should.be.a('array').to.deep.equal(result)
                    done()
                })
            })

    })

    describe('TC-303 List of meals', () => {

        //TC-303-1
        it.only('When requesting for a list of meals, a successful response with a array filled with objects should be returned',
            (done) => {
                chai
                    .request(server).get('/api/meal').end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body
                    status.should.equals(200);
                    result.should.be.a('array').to.deep.equal(result)
                    done()
                })
            })
    })

    describe('TC-304 Get details meal on ID', ()=> {

        //TC-304-1
        it.only('When requesting for a specific meal, but the ID does not exist, a valid error should be returned',
            (done) => {
                chai
                    .request(server).get('/api/meal/999').end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body
                    status.should.equals(404);
                    result.should.be.a('string').to.deep.equal('ID 999 Does not exist')
                    done()
                })
            })

        //TC-304-2
        it.only('When requesting for a specific meal, a successful response with a object should be returned',
            (done) => {
                chai
                    .request(server).get('/api/meal/2').end((err, res) => {
                    res.should.be.an('object')
                    let {status, result} = res.body
                    status.should.equals(200);
                    result.should.be.a('array').to.deep.equal(result)
                    done()
                })
            })

    })

    describe('TC-305 Delete meal on Id', ()=> {

        //TC-305-2
        it.only('When deleting a meal but you are not logged in, a valid error should be returned',
            (done) => {
                chai
                    .request(server).delete('/api/meal/2')
                    .end((err, res) => {
                    res.should.be.an('object')
                    let {status,error, datetime} = res.body
                    status.should.equals(401);
                    error.should.be.a('string').to.deep.equal('Authorization header missing!');
                    datetime.should.equals(datetime)
                    done()
                })
            })

        //TC-305-3
        it.only('When deleting a meal but its not your created meal, a proper error should be returned',
            (done) => {
                chai
                    .request(server).delete('/api/meal/1')
                    .set(
                        'authorization',
                        'Bearer ' + jwt.sign({ userId: 2 }, jwtSecretKey)
                    )
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status,result} = res.body
                        status.should.equals(403);
                        result.should.be.an('string').that.equals(' Your User ID does not match with the User ID of the creator of this object. You can not edit or delete other peoples products')
                        done()
                    })
            })

        //TC-305-4
        it.only('When deleting a meal but the id does not exist, a proper error should be returned',
            (done) => {
                chai
                    .request(server).delete('/api/meal/999')
                    .set(
                        'authorization',
                        'Bearer ' + jwt.sign({ userId: 2 }, jwtSecretKey)
                    )
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status,result} = res.body
                        status.should.equals(404);
                        result.should.be.an('string').that.equals('ID 999 Does not exist')
                        done()
                    })
            })

        //TC-305-4
        it.only('When deleting a meal but the id does not exist, a proper error should be returned',
            (done) => {
                chai
                    .request(server).delete('/api/meal/2')
                    .set(
                        'authorization',
                        'Bearer ' + jwt.sign({ userId: 1 }, jwtSecretKey)
                    )
                    .end((err, res) => {
                        res.should.be.an('object')
                        let {status,result} = res.body
                        status.should.equals(200);
                        result.should.be.an('string').that.equals('ID 2 successfully deleted from the DATABASE')
                        done()
                    })
            })
    })


})
