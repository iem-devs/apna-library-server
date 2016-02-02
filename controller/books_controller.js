/**
 * Books Controller
 */

'use strict'

var Book = require('../models/Book')
var _ = require('lodash')

/**
 * Get all books
 * @api GET /api/books
 * @param  req request object
 * @param  res response object
 * @return {book object Array}
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
