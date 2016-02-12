/**
 * Basic Error Model
 */

'use strict'

var Error = function (status, message) {
  return {
    status: status,
    message: message
  }
}

module.exports = Error
