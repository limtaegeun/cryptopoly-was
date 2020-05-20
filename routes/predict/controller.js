"use strict";

const express = require("express");
const HTTP_STATUS_CODES = require("http-status-codes");
const { Asset, CurrencyPair, PredictChart } = require("../../models");
const moment = require("moment");
const rp = require("request-promise");
const apiKey = require("../../config/coinapi.json").key;
const url = require("../../constant/url.json");
const _ = require("lodash");
import methods from "./methods";
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
    let { start, end, period } = req.query;

    methods
      .getPredictedAndToPredict(moment.utc(start), moment.utc(end), period)
      .then(real => {
        // console.log(result);
        if (real.upsert) {
          methods.upsertPredictByDate(real.upsert, 86400, 1).then(predicted => {
            console.log(real.data);
            console.log(predicted);
            res.status(HTTP_STATUS_CODES.OK).json({
              data: real.data.concat(predicted)
            });
          });
        } else {
          console.log(real.data);
          res.status(HTTP_STATUS_CODES.OK).json({
            data: real.data
          });
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
    let { start, end, period, pairId } = req.body;
    methods
      .upsertPredictByDate(
        {
          start: moment.utc(start).unix(),
          end: moment.utc(end).unix()
        },
        period,
        pairId
      )
      .then(predicted => {
        console.log(predicted);
        res.status(HTTP_STATUS_CODES.OK).json({
          data: period
        });
      });
  }
};

function isSamePeriod(now) {
  // now에서 1period전까지
}
