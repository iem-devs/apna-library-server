/**
 * @apiDefine BookModel
 * @apiSuccess {string} BookID ID of the Book
 * @apiSuccess {string} BookName Name of the Book
 * @apiSuccess {number} ISBN ISBN number
 * @apiSuccess {string} authorID AuthorID of the book
 * @apiSuccess {number} BookPrice Price of the book
 */

'use strict'

var mongoose = require('mongoose')

var Book = new mongoose.Schema({
  name: String,
  isbn: Number,
  author: mongoose.Schema.Types.ObjectId, // reference to another mongodb document
  goodreads: String,
  price: Number,
  borrowed: Boolean
})

module.exports = mongoose.model('Book', Book)
