"use strict";

const express = require("express");
const HTTP_STATUS_CODES = require("http-status-codes");
const { Currency, CurrencyPair, ChartData } = require("../../models");
const moment = require("moment");
const rp = require("request-promise");

module.exports = {
  /**
   * get Currency with id
   * @param req
   * @param res
   */
  getChartData(req, res) {
    let { id } = req.params;

    ChartData.findOne({
      where: {
        id: id
      }
    }).then(chartDatas => {
      res.status(HTTP_STATUS_CODES.OK).json({
        data: chartDatas
      });
    });
  },
  retrieveChartData(req, res) {
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

    ChartData.findAll(option)
      .then(chartDatas => {
        res.status(HTTP_STATUS_CODES.OK).json({
          data: chartDatas
        });
      })
      .catch(err => {
        console.log(
          "/currency ERROR : ",
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
  createChartData(req, res) {
    let body = req.body;
    console.log(body);

    ChartData.create(body)
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
  editChartData(req, res) {
    let body = req.body;
    // console.log(body);
    ChartData.findOne({ where: { id: body.id } }).then(function(obj) {
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
    ChartData.findOne({ where: { id: body.id } }).then(obj => {
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
    let { start, end, currencyPair } = req.query;
    start = moment.utc(start, "YYYY-MM-DD");
    end = moment.utc(end, "YYYY-MM-DD");
    console.log(req.query, start.unix(), end.unix());
    CurrencyPair.findOne({ where: { currencyPair: currencyPair } })
      .then(matchPair => {
        console.log(matchPair);
        rp.get(
          `https://poloniex.com/public?` +
            `command=returnChartData&currencyPair=${currencyPair}&` +
            `start=${start.unix()}&end=${end.unix()}&period=86400`
        ).then(data => {
          console.log("data:", data);
          data = JSON.parse(data);
          let createData = data.map(item => {
            let date = moment.unix(item.date);
            return {
              ...item,
              date: date,
              CurrencyPairId: matchPair.id
            };
          });
          ChartData.bulkCreate(createData);
          res.status(HTTP_STATUS_CODES.OK).json({
            success: true
          });
        });
        // .catch(err => {
        //   res
        //     .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
        //     .json({ success: false, err: err.message, stack: err.stack });
        // });
      })
      .catch(err => {
        res
          .status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR)
          .json({ success: false, err: err.message, stack: err.stack });
      });
  }
};
