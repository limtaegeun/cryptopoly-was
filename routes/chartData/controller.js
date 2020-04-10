"use strict";

const express = require("express");
const HTTP_STATUS_CODES = require("http-status-codes");
const { Asset, CurrencyPair, Chart1D, Chart30min } = require("../../models");
const moment = require("moment");
const rp = require("request-promise");
const methods = require("./methods");

module.exports = {
  /**
   * get Currency with id
   * @param req
   * @param res
   */
  getChartData(req, res) {
    let { id, period } = req.params;

    selectChartModel(period)
      .findOne({
        where: {
          id: id
        }
      })
      .then(chartDatas => {
        res.status(HTTP_STATUS_CODES.OK).json({
          data: chartDatas
        });
      });
  },
  retrieveChartData(req, res) {
    let { start, end, period } = req.query;
    start = moment(start, "YYYY-MM-DD");
    end = moment(end, "YYYY-MM-DD");
    console.log(req.query);
    let option = {
      order: [["date", "AES"]],
      date: {
        $between: [start.toISOString(true), end.toISOString(true)]
      }
    };

    selectChartModel(period)
      .findAll(option)
      .then(chartDatas => {
        res.status(HTTP_STATUS_CODES.OK).json({
          data: chartDatas
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
   * edit lookbook
   * @param req
   * @param res
   */
  editChartData(req, res) {
    let body = req.body;
    // console.log(body);
    selectChartModel(body.period)
      .findOne({ where: { id: body.id } })
      .then(function(obj) {
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
  deleteChartData(req, res) {
    let body = req.body;
    // console.log(body);
    selectChartModel(body.period)
      .findOne({ where: { id: body.id } })
      .then(obj => {
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
  /**
   * get data from api
   * @param req
   * @param res
   */
  batchGetChartDataFromApi(req, res) {
    let { start, end, base, quote, exchange, period } = req.query;
    start = moment.utc(start, "YYYY-MM-DD");
    end = moment.utc(end, "YYYY-MM-DD");
    console.log(req.query, start.unix(), end.unix());
    CurrencyPair.findOne({ where: { baseID: base, quoteID: quote } })
      .then(matchPair => {
        console.log(matchPair);
        switch (exchange) {
          case "poloniex":
            return methods.chartFromPoloniex(start, end, period, matchPair);
          default:
            return methods.chartFromPoloniex(start, end, period, matchPair);
        }
      })
      .then(({ createData, period }) => {
        switch (period) {
          case "1D":
            return methods.chart1DUpsert(createData);
          case "30m":
            return methods.chart30minUpsert(createData);
          default:
            throw "undefine period Error";
        }
      })
      .then(() => {
        res.status(HTTP_STATUS_CODES.OK).json({
          success: true
        });
      })
      .catch(err => {
        res
          .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ success: false, err: err.message, stack: err.stack });
      });
  }
};

function selectChartModel(period) {
  switch (period) {
    case "1D":
      return Chart1D;
    case "30m":
      return Chart30min;
    default:
      throw "undefine period Error";
  }
}
