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
      // console.log(err)
      if (err) console.log(err)
      parseString(body, function (err, result) {
        if (err) console.log(err)
        // console.log(JSON.stringify(result))
        console.log(JSON.stringify(result))
        if (parseInt(result['GoodreadsResponse']['search'][0]['total-results'][0], 10) > 0) {
          var results = result['GoodreadsResponse']['search'][0]['results'][0]['work']
          var books = []
          results.forEach(function (res) {
            books.push({
              id: res['best_book'][0]['id'][0]['_'],
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

/**
 * @api {get} /book/id Get book by ID
 * @apiVersion 0.0.2
 * @apiName getBookById
 * @apiGroup Book
 * @apiParam {String} id Id of the book
 *
 * @apiDescription Get book information by Id
 *
 * @apiHeader Authorization JWT token
 * @apiUse BookModel
 *
 * @apiError 401/Unauthorized Only authenticated users can access the data.
 * @apiError 404/NoBooksFound  No books were found in database
 */
exports.getBookById = function (req, res) {
  var id = req.query.id
  if (id && id !== '') {
    request('https://www.goodreads.com/book/show.xml?key=' + config.goodreads_key + '&id=' + id, function (err, response, body) {
      if (err) console.log(err)
      parseString(body, function (err, result) {
        if (err) console.log(err)
        // console.log(JSON.stringify(result))
        var bk = result['GoodreadsResponse']['book'][0]
        var book = {
          id: id,
          title: bk['title'][0],
          isbn: bk['isbn'][0],
          isbn13: bk['isbn13'][0],
          image_url: bk['image_url'][0],
          small_image_url: bk['small_image_url'][0],
          publication_year: bk['publication_year'][0],
          publication_month: bk['publication_month'][0],
          publication_day: bk['publication_day'][0],
          description: bk['description'][0].replace(/(\r\n|\n|\r)/gm, ''),
          average_rating: bk['average_rating'][0],
          num_pages: bk['num_pages'][0],
          ratings_count: bk['ratings_count'][0],
          text_reviews_count: bk['text_reviews_count'][0],
          url: bk['url'][0],
          authors: bk['authors'][0]['author'].map(function (author) {
            return {
              id: author['id'][0],
              name: author['name'][0],
              role: author['role'][0],
              image_url: author['image_url'][0]['_'].replace(/(\r\n|\n|\r)/gm, ''),
              small_image_url: author['small_image_url'][0]['_'].replace(/(\r\n|\n|\r)/gm, ''),
              link: author['link'][0],
              average_rating: author['average_rating'][0],
              ratings_count: author['ratings_count'][0],
              text_reviews_count: author['text_reviews_count'][0]
            }
          })
        }
        res.status(200).json(book)
      })
    })
  }
}
