"use strict";

const HTTP_STATUS_CODES = require("http-status-codes");
const { check, validationResult } = require("express-validator");
const { User } = require("../../models");

module.exports = {
  check: [
    check("email").custom(value => {
      if (value === "") {
        return Promise.reject("email required");
      }
      return User.findOne({ where: { email: value } }).then(user => {
        if (!user) {
          return Promise.reject("email does not exist ");
        }
      });
    })
  ],
  result(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        error: errors.mapped()
      });
    }
    next();
  }
};
