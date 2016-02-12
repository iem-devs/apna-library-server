/**
 * Test for User Authentication Module
 */

'use strict'

var request = require('supertest')
var app = require('../app')
var User = require('../models/User')
var otp

describe('Apna Library API User Authentication module', function () {
  describe('Local Authentication', function () {
    it('should return 400 on absent parameters', function (done) {
      request(app)
        .post('/api/login/local')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400, done)
    })
    it('should return 401 on invalid credentials', function (done) {
      request(app)
        .post('/api/login/local')
        .send({email: 'test@test.com', password: 'abcd'})
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(401, done)
    })
    it('registration should return 400 on absent parameters', function (done) {
      request(app)
        .post('/api/register')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(400, done)
    })

    var user_id

    it('registration should return 200 on valid parameters', function (done) {
      request(app)
        .post('/api/register')
        .set('Accept', 'application/json')
        .send({email: 'test@googlemail.com', password: 'google'})
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          if (err) done(err)
          user_id = res.body.user_id
          done()
        })
    })
    it('registration should return 409 on duplicate registration', function (done) {
      request(app)
        .post('/api/register')
        .set('Accept', 'application/json')
        .send({email: 'test@googlemail.com', password: 'google'})
        .expect('Content-Type', /json/)
        .expect(409, done)
    })
    it('should return 401 if valid credentials but verified false', function (done) {
      request(app)
        .post('/api/login/local')
        .send({email: 'test@googlemail.com', password: 'google'})
        .expect('Content-Type', /json/)
        .expect(401, done)
    })
    describe('Testing valid user login', function () {
      before(function (done) {
        User.update({_id: user_id}, {verified: true}, function (err, users) {
          if (err) done(err)
          done()
        })
      })
      it('should return 401 if verified true, correct username but incorrect password', function (done) {
        request(app)
          .post('/api/login/local')
          .send({email: 'test@googlemail.com', password: 'facebook'})
          .expect('Content-Type', /json/)
          .expect(401, done)
      })
      it('should return 200 with valid login credentials', function (done) {
        request(app)
          .post('/api/login/local')
          .send({email: 'test@googlemail.com', password: 'google'})
          .expect('Content-Type', /json/)
          .expect(200, done)
      })
      it('should return otp when prompted to change password', function (done) {
        request(app)
          .get('/api/login/forgotp?email=test@googlemail.com')
          .expect('Content-Type', /json/)
          .expect(200)
          .end(function (err, res) {
            if (err) done(err)
            otp = res.body.token
            user_id = res.body.id
            done()
          })
      })
      it('should return 404 when prompted to change password with wrong email', function (done) {
        request(app)
          .get('/api/login/forgotp?email=mars@googlemail.com')
          .expect('Content-Type', /json/)
          .expect(404, done)
      })
      it('should return 401 when otp is mismatched', function (done) {
        request(app)
          .post('/api/login/forgotp')
          .send({otp: parseInt(otp, 10) + 1, id: user_id, password: 'twitter'})
          .expect('Content-Type', /json/)
          .expect(401, done)
      })
      it('should return 200 when password changed', function (done) {
        request(app)
          .post('/api/login/forgotp')
          .send({otp: otp, id: user_id, password: 'twitter'})
          .expect('Content-Type', /json/)
          .expect(200, done)
      })
      it('should return 200 with valid login credentials after password change', function (done) {
        request(app)
          .post('/api/login/local')
          .send({email: 'test@googlemail.com', password: 'twitter'})
          .expect('Content-Type', /json/)
          .expect(200, done)
      })
      after(function (done) {
        User.remove({email: 'test@googlemail.com'}).exec()
        done()
      })
    })
  })
})
