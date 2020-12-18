"use strict";

const express = require("express");
const HTTP_STATUS_CODES = require("http-status-codes");
const { PwdAuth, User } = require("../../models");
const moment = require("moment");
const rp = require("request-promise");
const _ = require("lodash");
const methods = require("./methods");
const Op = require("sequelize");

module.exports = {
  issueAuthenticationKey(req, res) {
    let { email } = req.body;
    User.findOne({ where: { email: email } })
      .then(user => {
        if (user) {
          return methods.genPwdAuthKey(user.id);
        } else {
          throw "undefine user";
        }
      })
      .then(auth => {
        console.log(auth);
        return methods.sendEmail(
          "tgl@example.com",
          "imori333@gmail.com",
          "test",
          `hi http://localhost:8080?key=${auth.token}`
        );
      })
      .then(() => {
        return res.status(200).json({ success: true });
      })
      .catch(err => {
        return res
          .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ success: false, err: err.message, stack: err.stack });
      });
  },
  resetPassword(req, res) {
    let { token, newPwd } = req.body;
    // 입력받은 token 값이 Auth 테이블에 존재하며 아직 유효한지 확인

    PwdAuth.findOne({
      where: {
        token: token
      }
    })
      .then(auth => {
        if (!auth) {
          throw "undefine";
        }
        let duetime = moment.utc(auth.createdAT).unix();
        let now = moment.utc().unix();
        if (duetime < now) {
          throw "expiration";
        }
        return User.findByPk(auth.userId);
      })
      .then(user => {
        // 유저 비밀번호 업데이트
        return methods.changeHashedPassword(newPwd, user.salt).then(hash => {
          user.password = hash.hashedPwd;
          return user.save();
        });
      })
      .then(() => {
        return res.status(200).json({ success: true });
      })
      .catch(err => {
        return res
          .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ success: false, err: err.message, stack: err.stack });
      });
  }
};
