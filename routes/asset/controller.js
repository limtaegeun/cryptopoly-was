"use strict";

const express = require("express");
const HTTP_STATUS_CODES = require("http-status-codes");
const { Asset, CurrencyPair, ChartData } = require("../../models");
const moment = require("moment");
const rp = require("request-promise");

module.exports = {
  /**
   * get Currency with id
   * @param req
   * @param res
   */
  getAsset(req, res) {
    let { id } = req.params;

    Asset.findOne({
      where: {
        id: id
      }
    }).then(assets => {
      res.status(HTTP_STATUS_CODES.OK).json({
        data: assets
      });
    });
  },
  retrieveAsset(req, res) {
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

    Asset.findAll(option)
      .then(assets => {
        res.status(HTTP_STATUS_CODES.OK).json({
          data: assets
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
  createAsset(req, res) {
    let body = req.body;
    console.log(body);

    Asset.create(body)
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
  editAsset(req, res) {
    let body = req.body;
    // console.log(body);
    Asset.findOne({ where: { id: body.id } }).then(function(obj) {
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
  deleteAsset(req, res) {
    let body = req.body;
    // console.log(body);
    Asset.findOne({ where: { id: body.id } }).then(obj => {
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
  batchGetAssetFromApi(req, res) {
    rp.get(`https://poloniex.com/public?command=returnCurrencies`)
      .then(data => {
        data = JSON.parse(data);
        console.log(data);
        let assets = [];
        for (let [key, value] of Object.entries(data)) {
          assets.push({ code: key, ...value });
        }
        Asset.bulkCreate(assets);
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
