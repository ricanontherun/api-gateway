const mongoose = require('mongoose')
const supertest = require('supertest')
const {expect} = require('chai')

const servers = require('../lib/server')
const testService = require('./testService')
const {Server} = require('../lib/models')

const testServiceUrl = `http://localhost:${parseInt(process.env.HTTP_PORT) + 1}`

describe('Proxy test', () => {
  // Make sure nothing is registered.
  beforeEach((done) => {
    Server.deleteMany({}).then(() => {
      done()
    })
  })

  after((done) => {
    testService.close(() => {
      servers.http.close(() => {
        mongoose.connection.close(done)
      })
    })
  })

  it('returns a 404 when the customers server is not registered.', (done) => {
    supertest(servers.http)
      .get('/customers/find/1234')
      .expect(404, 'No registered service could handle your request', done)
  })

  it('returns a 404 when requesting a service prefix that hasn\'t been registered', (done) => {
    Server.create({
      label: 'c',
      prefix: 'customers',
      baseUrl: testServiceUrl
    }).then(() => {
      setTimeout(() => {
        supertest(servers.http)
          .get('/products/pants')
          .expect(404, 'No registered service could handle your request', done)
      }, 250)
    })
  })

  it('can strip the path prefix, by default, before proxying to the registered server', (done) => {
    Server.create({
      label: 'c',
      prefix: 'customers',
      baseUrl: testServiceUrl
    }).then(() => {
      setTimeout(() => {
        supertest(servers.http)
          .get('/customers/find/1234')
          .expect(200, {
            name: 'Christian Roman',
            id: 1234
          }, done)
      }, 250)
    })
  })

  it('can retain the path prefix when proxying to a registered server', (done) => {
    Server.create({
      label: 'c',
      prefix: 'products',
      baseUrl: testServiceUrl,
      stripPrefix: false
    }).then(() => {
      setTimeout(() => {
        supertest(servers.http)
          .get('/products/112233')
          .expect(200, {
            name: 'Handbag',
            id: 112233
          }, done)
      }, 250)
    })
  })

  it('can forward headers to a registered server', (done) => {
    Server.create({
      label: 'c',
      prefix: 'headers',
      baseUrl: testServiceUrl,
      stripPrefix: false,
      allowedHeaders: ['x-test-1']
    }).then(() => {
      setTimeout(() => {
        supertest(servers.http)
          .get('/headers')
          .set('x-test-1', 100)
          .set('x-test-2', 200)
          .expect((response) => {
            expect(response.body).to.have.property('x-test-1')
            expect(response.body['x-test-1']).to.equal('100')

            expect(response.body).to.not.have.property('x-test-2')
          })
          .expect(200, done)
      }, 250)
    })
  })

  it('can forward query params to a registered server', (done) => {
    Server.create({
      label: 'c',
      prefix: 'params',
      baseUrl: testServiceUrl,
      stripPrefix: false,
      allowedParams: ['customerID', 'userID']
    }).then(() => {
      setTimeout(() => {
        supertest(servers.http)
          .get('/params?userID=1&customerID=2&accountID=3')
          .expect((response) => {
            expect(response.body).to.have.property('userID')
            expect(response.body['userID']).to.equal('1')

            expect(response.body).to.have.property('customerID')
            expect(response.body['customerID']).to.equal('2')

            expect(response.body).to.not.have.property('accountID')
          })
          .expect(200, done)
      }, 250)
    })
  })
})