"use strict";
const {
  Currency,
  CurrencyPair,
  Chart1D,
  Chart30min,
  PredictChart
} = require("../../models");
const moment = require("moment");
const rp = require("request-promise");
const url = require("../../constant/url.json");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const async = require("async");
const crypto = require("crypto");
const pwdConfig = require("./../../config/crypto.json");

module.exports = {
  hashPassword
};

/**
 *
 * @param password {string}
 * @param callback {closer}- (hasedPwd, salt) => {}
 */
function hashPassword(password, callback) {
  crypto.randomBytes(pwdConfig.pwd.keylen, (err, buf) => {
    let salt = buf.toString("base64");
    crypto.pbkdf2(
      password,
      salt,
      pwdConfig.pwd.iterations,
      pwdConfig.pwd.keylen,
      pwdConfig.pwd.digest,
      (err, key) => {
        const hashedPwd = key.toString("base64");
        console.log(hashedPwd);
        callback(hashedPwd, salt);
      }
    );
  });
}
