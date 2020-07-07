"use strict";

const express = require("express");
const HTTP_STATUS_CODES = require("http-status-codes");
const { PwdAuth } = require("../../models");
const moment = require("moment");
const rp = require("request-promise");
const _ = require("lodash");
const methods = require("./methods");
module.exports = {
  issueAuthenticationKey(req, res) {},
  sendEmail(req, res) {
    methods
      .sendEmail(
        "tgl@example.com",
        "imori333@gmail.com",
        "test",
        "hi http://localhost:8080?key=sldjfrnf2ek"
      )
      .then(result => {
        console.log(result);
        return res.status(200).json({ success: true, data: result });
      });
  }
};
