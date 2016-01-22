/**
 * Dummy test stub
 */

'use strict'

var request = require('supertest')
var app = require('../app')

describe('Apna Library Dummy test stub', function () {
  it('should expose api endpoint', function (done) {
    request(app)
      .get('/api')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done)
  })
})
