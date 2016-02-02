/**
 * Books Model
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
