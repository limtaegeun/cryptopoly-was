"use strict";

const HTTP_STATUS_CODES = require("http-status-codes");
const { check, validationResult } = require("express-validator");
const { User } = require("../../models");

module.exports = {
  signUpCheck: [
    check("email").custom(value => {
      return User.findOne({ where: { email: value } }).then(user => {
        if (user) {
          return Promise.reject("E-mail already in use");
        }
      });
    })
  ],
  signUpResult(req, res, next) {
    // console.log(req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        error: errors.mapped()
      });
    }
    next();
  }
};
