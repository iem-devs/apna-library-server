/**
 * @apiDefine UserModel
 * @apiSuccess {String} UserID ID of the User
 * @apiSuccess {String} name Name of the User
 * @apiSuccess {String} email Email of the User
 * @apiSuccess {String} birth_date Birth Date
 * @apiSuccess {Number} phone Phone number
 * @apiSuccess {Boolean} verified Mobile verified flag
 * @apiSuccess {Object} location Location object
 * @apiSuccess {Number[]} location.coords GPS coordinates [lat, lon]
 * @apiSuccess {Object} address Address object
 * @apiSuccess {String} address.residence Residence address
 * @apiSuccess {String} address.work Work address
 * @apiSuccess {String} image Image URL
 * @apiSuccess {String} gcm_id GCM ID
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
