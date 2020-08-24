"use strict";

const express = require("express");
const HTTP_STATUS_CODES = require("http-status-codes");
const { User } = require("../../models");
const moment = require("moment");
const rp = require("request-promise");
const _ = require("lodash");

import methods from "./methods";

module.exports = {
  login(req, res) {
    let body = req.body;
    return res.status(200).json({
      success: true,
      user: { email: req.user.email, username: req.user.username }
    });
  },
  signUp(req, res) {
    let body = req.body;
    methods
      .hashPassword(body.password)
      .then((hash, salt) => {
        return User.create({
          email: body.email,
          username: body.username,
          password: hash,
          salt: salt
        });
      })
      .then(function(result) {
        return res.status(200).json({ success: true, data: result });
      })
      .catch(function(err) {
        return res
          .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ success: false, err: err.message, stack: err.stack });
      });
  },
  logout(req, res) {
    req.logout();
    return res.status(200).json({
      success: true
    });
  }
};
