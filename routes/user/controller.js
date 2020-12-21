"use strict";

const express = require("express");
const HTTP_STATUS_CODES = require("http-status-codes");
const { User } = require("../../models");
const moment = require("moment");
const rp = require("request-promise");
const _ = require("lodash");

import methods from "./methods";
import {
  comparePassword,
  genHashedPasswordBySalt
} from "../../plugin/password";

module.exports = {
  loginCheck(req, res) {
    console.log("check user:", req.user);
    if (req.isAuthenticated() && req.user) {
      console.log("auth user:", req.user.email);
      return res.status(200).json({
        success: true,
        user: req.user
      });
    }
    return res.status(200).json({
      success: false,
      user: null
    });
  },
  login(req, res) {
    let body = req.body;
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    console.log("login request user :", req.user.email);
    return res.status(200).json({
      success: true,
      user: req.user
    });
  },
  signUp(req, res) {
    let body = req.body;
    methods
      .hashPassword(body.password)
      .then(hash => {
        console.log(hash.salt);
        return User.create({
          email: body.email,
          username: body.username,
          password: hash.hashedPwd,
          salt: hash.salt
        });
      })
      .then(function(result) {
        return res.status(200).json({ user: result });
      })
      .catch(function(err) {
        return res
          .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ success: false, err: err.message, stack: err.stack });
      });
  },
  editUser(req, res) {
    if (req.isAuthenticated() && req.user) {
      let body = req.body;
      req.user
        .update(body)
        .then(result => {
          return res.status(200).json({
            result
          });
        })
        .catch(err => {
          return res
            .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
            .json({ success: false, err: err.message, stack: err.stack });
        });
    } else {
      return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
        err: "authenticated fail"
      });
    }
  },
  logout(req, res) {
    req.logout();
    return res.status(200).json({
      success: true
    });
  },
  changePassword(req, res) {
    let { pwd, newPwd } = req.body;
    let user = req.user;
    comparePassword(user, pwd, (passError, isMatch) => {
      if (isMatch) {
        methods
          .hashPassword(newPwd)
          .then(hash => {
            user.password = hash.hashedPwd;
            user.salt = hash.salt;
            return user.save();
          })
          .then(() => {
            return res.status(200).json({ success: true });
          })
          .catch(function(err) {
            return res
              .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
              .json({ success: false, err: err.message, stack: err.stack });
          });
      } else {
        return res
          .status(HTTP_STATUS_CODES.BAD_REQUEST)
          .json({ success: false, msg: "The password is incorrect." });
      }
    });
  }
};
