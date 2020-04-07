"use strict";
const { Currency, CurrencyPair, ChartData } = require("../../models");
const moment = require("moment");
const rp = require("request-promise");

module.exports = {
  chartFromPoloniex
};

function chartFromPoloniex(start, end, period, pair) {
  return new Promise((resolve, reject) => {
    let periodSec = toSec(period)
      .get(
        `https://poloniex.com/public?` +
          `command=returnChartData&currencyPair=${pair.currencyPair}&` +
          `start=${start.unix()}&end=${end.unix()}&period=${periodSec}`
      )
      .then(data => {
        console.log("data:", data);
        data = JSON.parse(data);
        let createData = data.map(item => {
          let date = moment.unix(item.date);
          return {
            ...item,
            date: date,
            CurrencyPairId: pair.id
          };
        });
        resolve(createData);
      })
      .catch(err => {
        reject(err);
      });
  });
}

function toSec(period) {
  switch (period) {
    case "1DAY":
      return "86400";
    default:
      return "86400";
  }
}
