"use strict";

const express = require("express");
const HTTP_STATUS_CODES = require("http-status-codes");
const { Asset, CurrencyPair, PredictChart } = require("../../models");
const moment = require("moment");
const rp = require("request-promise");
const apiKey = require("../../config/coinapi.json").key;
const url = require("../../constant/url.json");
const _ = require("lodash");
module.exports = {
  getPredict(req, res) {
    let { id } = req.params;

    PredictChart.findOne({
      where: {
        id: id
      }
    }).then(predicts => {
      res.status(HTTP_STATUS_CODES.OK).json({
        data: predicts
      });
    });
  },
  retrievePredict(req, res) {
    let { start, end } = req.query;
    // todo : query should option but now required
    start = moment(start, "YYYY-MM-DD");
    end = moment(end, "YYYY-MM-DD");
    console.log(req.query);
    let option = {
      order: [["date", "AES"]],
      date: {
        $between: [start.toISOString(true), end.toISOString(true)]
      }
    };

    PredictChart.findAll(option)
      .then(predicts => {
        res.status(HTTP_STATUS_CODES.OK).json({
          data: predicts
        });
      })
      .catch(err => {
        console.log(
          "/asset ERROR : ",
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
  createPredict(req, res) {
    let body = req.body;
    console.log(body);

    PredictChart.create(body)
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
  updatePredict(req, res) {
    let body = req.body;
    // console.log(body);
    PredictChart.findOne({ where: { id: body.id } }).then(function(obj) {
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
   * delete chart data
   * @param req
   * @param res
   */
  deletePredict(req, res) {
    let body = req.body;
    // console.log(body);
    PredictChart.findOne({ where: { id: body.id } }).then(obj => {
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
  },
  batchGetPredict(req, res) {
    let { start, end, period, base, quote } = req.body;
    console.log(getMLApiUrl() + "/predict");
    let realData = {
      data:
        "[[9132.39096122,8891.51753701,8032.01789601,7930.30000002,7891.25967057]]"
    };
    PredictChart.findAll({ where: {} });
  }
};

function isSamePeriod(now) {
  // now에서 1period전까지
}
