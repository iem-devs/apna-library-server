/**
 * Books testing suite
 */

'use strict'

var request = require('supertest')
var app = require('../app')
var expect = require('chai').expect

describe('Apna Library Testing suite', function () {
  // tests whether the api endpoint is accessible or not
  it('should return books api', function (done) {
    request(app)
      .get('/api/books')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done)
  })

  // tests whether the api returns an array or not
  it('should return an array of books', function (done) {
    request(app)
      .get('/api/books')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function (err, res) {
        if (err) console.log(err)
        var books = res.body
        expect(books).to.be.an('array')
        done()
      })
  })
})
