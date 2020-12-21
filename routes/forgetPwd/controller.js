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
          "tgl@cryptopoly.com",
          email,
          "[Cryptopoly] Reset Password",
          `http://localhost:8080/reset?token=${auth.token}`
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
    let authInstance;
    PwdAuth.findOne({
      where: {
        token: token
      }
    })
      .then(auth => {
        if (!auth) {
          throw "undefine";
        }
        authInstance = auth;
        let duetime = moment.utc(auth.createdAt).unix() + auth.ttl;
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
        authInstance.ttl = 0;
        authInstance.save();
        return res.status(200).json({ success: true });
      })
      .catch(err => {
        if (err === "expiration") {
          return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
            success: false,
            err: "The authentication key has expired."
          });
        }
        return res
          .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ success: false, err: err.message, stack: err.stack });
      });
  }
};
