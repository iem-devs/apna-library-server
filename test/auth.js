/**
 * Test for Authentication Module
 */

'use strict'

var request = require('supertest')
var app = require('../app')
var User = require('../models/User')
var jwt = require('../services/jwt')

describe('Transparency API Authentication Module', function () {
  var JWT
  var user_id

  before(function (done) {
    // save one test user in database
    var testUser = new User({
      name: 'test',
      email: 'test@google.com'
    })
    testUser.save(function (err, user) {
      if (err) console.log('MongoDB save error')
      user_id = user.id
      // sign a JWT token with user id and email
      JWT = jwt.sign(user.id, user.email)
      done()
    })
  })

  it('should return 401 for missing token', function (done) {
    request(app)
      .get('/api/secret')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(401, done)
  })

  it('should return 401 for empty token', function (done) {
    request(app)
      .get('/api/secret')
      .set('Accept', 'application/json')
      .set('Authorization', '')
      .expect('Content-Type', /json/)
      .expect(401, done)
  })

  it('should return 401 for invalid token', function (done) {
    request(app)
      .get('/api/secret')
      .set('Accept', 'application/json')
      .set('Authorization', 'saaadds')
      .expect('Content-Type', /json/)
      .expect(401, done)
  })

  it('should return 200 for valid token', function (done) {
    request(app)
      .get('/api/secret')
      .set('Accept', 'application/json')
      .set('Authorization', JWT)
      .expect('Content-Type', /json/)
      .expect(200, done)
  })

  after(function (done) {
    // remove our dummy data from db
    var query = User.where({_id: user_id})
    query.find().remove(function () {
      done()
    })
  })
})
