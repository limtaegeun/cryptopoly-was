"use strict";

const express = require("express");
const HTTP_STATUS_CODES = require("http-status-codes");
const { Currency } = require("../../models");
module.exports = {
  /**
   * get Currency with id
   * @param req
   * @param res
   */
  getCurrency(req, res) {
    let { id } = req.params;

    Currency.findOne({
      where: {
        id: id
      }
    }).then(currency => {
      res.status(HTTP_STATUS_CODES.OK).json({
        data: currency
      });
    });
  },
  retrieveCurrency(req, res) {
    let { limit, page, init } = req.query;
    // todo : query should option but now required
    let option = {
      order: [["score", "DESC"]]
    };
    if (init === "true") {
      option["where"] = {
        score: 0
      };
    }
    if (limit && page) {
      option["limit"] = parseInt(limit);
      option["offset"] = parseInt(limit * page);
    }
    Currency.findAll(option)
      .then(currencies => {
        res.status(HTTP_STATUS_CODES.OK).json({
          data: currencies
        });
      })
      .catch(err => {
        console.log(
          "/lookbook ERROR : ",
          JSON.stringify({ success: false, err: err.message, stack: err.stack })
        );
        res
          .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ success: false, err: err.message, stack: err.stack });
      });
  },
  /**
   * create lookbook
   * @param req
   * @param res
   */
  createCurrency(req, res) {
    let body = req.body;
    console.log(body);

    Currency.create(body)
      .then(function(result) {
        return res.status(200).json({ success: true, data: result });
      })
      .catch(function(err) {
        return res
          .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ success: false, err: err.message, stack: err.stack });
      });
  },
  /**
   * edit lookbook
   * @param req
   * @param res
   */
  editCurrency(req, res) {
    let body = req.body;
    // console.log(body);
    Currency.findOne({ where: { id: body.id } }).then(function(obj) {
      if (obj) {
        // update
        obj
          .update(body)
          .then(function(result) {
            res.status(200).json({ success: true, data: result });
          })
          .catch(function(err) {
            res
              .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
              .json({ success: false, err: err.message, stack: err.stack });
          });
      } else {
        // insert
        res
          .status(HTTP_STATUS_CODES.BAD_REQUEST)
          .json({ success: false, err: "invalid code" });
      }
    });
  },
  /**
   * delete lookbook
   * @param req
   * @param res
   */
  deleteCurrency(req, res) {
    let body = req.body;
    // console.log(body);
    Currency.findOne({ where: { id: body.id } }).then(obj => {
      if (obj) {
        obj.destroy().then(() => {
          res.status(200).json({ success: true });
        });
      } else {
        res
          .status(HTTP_STATUS_CODES.BAD_REQUEST)
          .json({ success: false, err: "invalid code" });
      }
    });
  }
};
