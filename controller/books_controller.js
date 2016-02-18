/**
 * Books Controller
 */

'use strict'

var Book = require('../models/Book')
var _ = require('lodash')
var parseString = require('xml2js').parseString
var request = require('request')
var config = require('../config/config')
// var request = require('request')

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
  // var isbn = req.query.isbn
}

/**
 * @api {get} /book/name Get book by name
 * @apiVersion 0.0.2
 * @apiName getBookByName
 * @apiGroup Book
 * @apiParam {String} q Name of the book
 *
 * @apiDescription Get book information by name
 *
 * @apiHeader Authorization JWT token
 * @apiUse BookModel
 *
 * @apiError 401/Unauthorized Only authenticated users can access the data.
 * @apiError 404/NoBooksFound  No books were found in database
 */
exports.getBookByName = function (req, res) {
  var query = req.query.q
  if (query && query !== '') {
    request('https://www.goodreads.com/search/index.xml?key=' + config.goodreads_key + '&q=' + query, function (err, response, body) {
      console.log(response.statusCode)
      console.log(err)
      parseString(body, function (err, result) {
        if (err) console.log(err)
        // console.log(JSON.stringify(result))
        console.log(JSON.stringify(result))
        if (parseInt(result['GoodreadsResponse']['search'][0]['total-results'][0], 10) > 0) {
          var results = result['GoodreadsResponse']['search'][0]['results'][0]['work']
          var books = []
          results.forEach(function (res) {
            books.push({
              id: res.id[0]['_'],
              pub_year: res['original_publication_year'][0]['_'],
              rating: res['average_rating'][0],
              title: res['best_book'][0]['title'][0],
              author: {
                id: res['best_book'][0]['author'][0]['id'][0]['_'],
                name: res['best_book'][0]['author'][0]['name'][0]
              },
              image_url: res['best_book'][0]['image_url'][0],
              small_image_url: res['best_book'][0]['small_image_url'][0]
            })
          })
          res.status(200).json(books)
        } else {
          res.status(404).json({status: 'No Books Found'})
        }
      })
    })
  }
}
