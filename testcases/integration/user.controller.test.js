const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
let testDatabase = [];

chai.should();
chai.use(chaiHttp)

describe('Manage Users ',()=>{
    describe('US-201 add user /api/user',() => {
        beforeEach((done)=> {
            testDatabase = [];
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
    })
})
