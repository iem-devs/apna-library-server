/**
 * Books Controller
 */

'use strict'

var Book = require('../models/Book')
var _ = require('lodash')
var request = require('request')

/**
 * @api {get} /books Get all books
 * @apiVersion 0.0.2
 * @apiName getAllBooks
 * @apiGroup Book
 *
 * @apiDescription Get book information stored in server
 *
 * @apiExample Example usage :
 * curl -i http://localhost:3000/api/books
 *
 * @apiHeader Authorization JWT token
 * @apiUse BookModel
 *
 * @apiError 401/Unauthorized Only authenticated users can access the data.
 * @apiError 404/NoBooksFound  No books were found in database
 */
exports.getAllBooks = function (req, res) {
  Book
    .find({})
    .exec(function (err, books) {
      if (err) {
        res.status(500).json({ error: 'ServerError', message: 'Server Error' })
      } else {
        if (!_.isEmpty(books)) {
          res.status(200).json(books)
        } else {
          res.status(404).json({ error: 'NoBooksFound', message: 'No Books found in database' })
        }
      }
    })
}

exports.getBookByISBN = function (req, res) {
  var isbn = req.query.isbn
}
