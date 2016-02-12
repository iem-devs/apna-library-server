/**
 * Schema Checker Service
 */

'use strict'

var _ = require('lodash')
var flatten = require('flat')

/**
 * Function to check whether user input schema conforms to model schema
 * @param  model model to check schema
 * @param  input user input
 * @return {boolean} true / false
 */
exports.checkSchema = function (model, input) {
  var keys = _.keys(flatten(input, {safe: true}))
  var schema = model.schema
  for (var i = 0; i < keys.length; i++) {
    if (!_.has(schema.paths, keys[i])) {
      return false
    }
  }
  return true
}
