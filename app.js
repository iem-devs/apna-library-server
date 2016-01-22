/**
 * Main Entry file for API Server
 */

'use strict'

var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var mongoose = require('mongoose')
var cors = require('cors')
var api = require('./routes/api')

// Set running port of app
app.set('port', process.env.PORT || 3000)

/**
 * Connect to MongoDB
 */
mongoose.connect('mongodb://localhost:27017/transparency')
mongoose.connection.on('error', function () {
  console.log('Mongoose Error.')
})

/**
 * Configure Middlewares
 */

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(cors())

/**
 * Configure Main route
 */
app.use('/api', api)

// catch 404 and provide appropriate error message
app.use(function (req, res) {
  res.status(404).json(Error('NotFound', 'Url or resource not found'))
})

/**
 * Run the server
 */

var server = app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + server.address().port)
})

module.exports = app
