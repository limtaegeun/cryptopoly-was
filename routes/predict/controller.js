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
    // todo : 1 과거 예측은 confirm 데이터 받아오기
    let pastDates = methods.getTimeOfPeriod(
      moment.utc(start).unix(),
      moment().unix(),
      period
    );
    methods
      .getPastPredictData(
        moment.unix(pastDates.start),
        moment.unix(pastDates.end),
        period,
        pairId
      )
      .then(confirmed => {});

    // todo : 2 미래 예측은 기존 알고리즘 사용
    let futurePredictDates = methods.getTimeOfPeriod(
      moment().unix(),
      moment.utc(end).unix(),
      period
    );
    methods
      .getPredictedAndToPredict(
        moment.unix(futurePredictDates.start),
        moment.unix(futurePredictDates.end),
        period
      )
      .then(predicted => {
        console.log(predicted);
        if (predicted.upsert) {
          methods
            .upsertPredictByDate(predicted.upsert, 86400, 1)
            .then(newPredict => {
              seqh.logOfInstance(predicted.data, "Predicted");
              seqh.logOfInstance(newPredict, "newPredict");
              res.status(HTTP_STATUS_CODES.OK).json({
                data: predicted.data.concat(newPredict)
              });
            });
        } else {
          seqh.logOfInstance(predicted.data);
          res.status(HTTP_STATUS_CODES.OK).json({
            data: predicted.data
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
