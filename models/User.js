/**
 * User Model
 */

'use strict'

var mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
var bcrypt = require('bcrypt')
var SALT_WORK_FACTOR = 10

var User = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: Number,
  verified: Boolean,
  birth_date: String,
  location: {
    coords: {
      type: [Number],
      index: '2d'
    }
  },
  address: {
    residence: String,
    work: String
  },
  image: String,
  token: Number,
  gcm_id: String
})

User.virtual('id').get(function () {
  return this._id
})

User.pre('save', function (next) {
  var user = this
  if (!user.isModified('password')) {
    return next()
  }
  // hashing the password
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) {
      return next(err)
    }
    bcrypt.hash(user.password, salt, function (err, hash) {
      if (err) {
        return next(err)
      }
      user.password = hash
      next()
    })
  })
})

User.methods.comparePassword = function (candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
    if (err) {
      return cb(err)
    }
    cb(null, isMatch)
  })
}

module.exports = mongoose.model('User', User)
