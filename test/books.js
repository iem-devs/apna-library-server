/**
 * Books testing suite
 */

'use strict'

var request = require('supertest')
var app = require('../app')
var expect = require('chai').expect
var Book = require('../models/Book')

describe('Apna Library Testing suite', function () {
  var book_id

  before(function (done) {
    // save one test book in database
    var testBook = new Book({
      name: 'Test Book',
      isbn: 1234
    })
    testBook.save(function (err, book) {
      if (err) console.log('MongoDB save error')
      book_id = book.id
      done()
    })
  })

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

  after(function (done) {
    // remove our dummy book entry from database
    var query = Book.where({_id: book_id})
    query.find().remove(function () {
      done()
    })
  })
})
