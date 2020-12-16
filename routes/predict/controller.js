"use strict";

const express = require("express");
const HTTP_STATUS_CODES = require("http-status-codes");
const { Asset, CurrencyPair, PredictChart } = require("../../models");
const moment = require("moment");
const rp = require("request-promise");
const apiKey = require("../../config/coinapi.json").key;
const url = require("../../constant/url.json");
const _ = require("lodash");
const seqh = require("../../plugin/sequelizeHelper");
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
    let { start, end, period, pairId } = req.query;
    period = Number(period);
    let asyncList = [];
    let pastDates = methods.getTimeOfPeriod(
      moment.utc(start).unix(),
      Math.min(moment().unix(), moment(end).unix()),
      period
    );

    if (pastDates) {
      let pastPredictPromise = methods.getPastPredictData(
        moment.unix(pastDates.start),
        moment.unix(pastDates.end),
        period,
        pairId
      );
      asyncList.push(pastPredictPromise);
    }

    let futurePredictDates = methods.getTimeOfPeriod(
      Math.max(moment().unix(), moment(start).unix()),
      moment.utc(end).unix(),
      period
    );

    if (futurePredictDates) {
      let futurePredictPromise = methods.getPredictByPredicted(
        futurePredictDates,
        period,
        pairId
      );
      asyncList.push(futurePredictPromise);
    }
    console.log("past:", pastDates, "future: ", futurePredictDates);
    Promise.all(asyncList).then(value => {
      let concatedValue = value.reduce((acc, cur) => {
        acc = acc.concat(cur);
        return acc;
      });
      res.status(HTTP_STATUS_CODES.OK).json({
        data: concatedValue
      });
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
