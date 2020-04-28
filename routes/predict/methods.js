"use strict";
const {
  Currency,
  CurrencyPair,
  Chart1D,
  Chart30min,
  PredictChart
} = require("../../models");
const moment = require("moment");
const rp = require("request-promise");
const url = require("../../constant/url.json");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports = {
  requestPredict,
  samePeriod,
  getPredictedAndToPredict
};

function requestPredict(data, period) {
  let form = data;
  form["period"] = period;

  let options = {
    method: "POST",
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    },
    uri: getMLApiUrl() + "/predict",
    form: form
  };
  return rp(options);
}

function getMLApiUrl() {
  if (process.env.NODE_ENV === "production") {
    return url.mlApi.prod;
  } else {
    return url.mlApi.local;
  }
}

/**
 * predict find and return what is need to update
 * @param start {moment}
 * @param end {moment}
 * @param period {int}
 */
function getPredictedAndToPredict(start, end, period) {
  return new Promise((resolve, reject) => {
    let periodRange = samePeriod(moment("2020-04-01"), period);
    PredictChart.findAll({
      where: {
        date: {
          [Op.between]: [start.toISOString(), end.toISOString()]
        },
        period: period,
        updatedAt: {
          [Op.between]: [
            periodRange.start.toISOString(),
            periodRange.end.toISOString()
          ]
        }
      }
    }).then(data => {
      resolve({ data: data, upsert: "" });
    });
  });
}

/**
 * return same period
 * @param now {moment}
 * @param period {int}
 */
function samePeriod(now, period) {
  // now에서 1period전까지
  let utcSec = moment(now).unix();
  return {
    start: moment.unix((utcSec / period) * period),
    end: moment.unix((utcSec / period) * period + period - 0.001)
  };
}
