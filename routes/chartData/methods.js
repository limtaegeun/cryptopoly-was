"use strict";
const { Currency, CurrencyPair, Chart1D, Chart30min } = require("../../models");
const moment = require("moment");
const rp = require("request-promise");

module.exports = {
  chartFromPoloniex,
  chart1DUpsert,
  chart30minUpsert
};

function chartFromPoloniex(start, end, period, pair) {
  return new Promise((resolve, reject) => {
    let periodSec = toSec(period);
    rp.get(
      `https://poloniex.com/public?` +
        `command=returnChartData&currencyPair=${pair.currencyPair}&` +
        `start=${start.unix()}&end=${end.unix()}&period=${periodSec}`
    )
      .then(data => {
        console.log("data:", data);
        data = JSON.parse(data);
        let createData = data.map(item => {
          let startDate = moment.unix(item.date);
          return {
            ...item,
            date: startDate,
            CurrencyPairId: pair.id
          };
        });
        resolve({ createData, period });
      })
      .catch(err => {
        reject(err);
      });
  });
}

function toSec(period) {
  switch (period) {
    case "1D":
      return "86400";
    case "30m":
      return "1800";
    default:
      throw "undefine period Error";
  }
}

function chart1DUpsert(createData) {
  return Chart1D.bulkCreate(createData, {
    fields: [
      "date",
      "high",
      "low",
      "open",
      "close",
      "volume",
      "tradesCount",
      "CurrencyPairId"
    ],
    updateOnDuplicate: [
      "date",
      "high",
      "low",
      "open",
      "close",
      "volume",
      "tradesCount",
      "CurrencyPairId"
    ]
  });
}
function chart30minUpsert(createData) {
  return Chart30min.bulkCreate(createData, {
    fields: [
      "date",
      "high",
      "low",
      "open",
      "close",
      "volume",
      "tradesCount",
      "CurrencyPairId"
    ],
    updateOnDuplicate: [
      "date",
      "high",
      "low",
      "open",
      "close",
      "volume",
      "tradesCount",
      "CurrencyPairId"
    ]
  });
}
