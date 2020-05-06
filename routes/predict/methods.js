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
  getSamePeriod,
  getPredictedAndToPredict,
  getChartData,
  parseToLTCM,
  upsertPredictByDate
};

/**
 * predict find and return what is need to update
 * @param start {moment}
 * @param end {moment}
 * @param period {int}
 */
function getPredictedAndToPredict(start, end, period) {
  return new Promise((resolve, reject) => {
    let periodRange = getSamePeriod(moment("2020-04-01"), period);
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
      data.sort((a, b) => {
        if (a.date < b.date) {
          return -1;
        }
        if (a.date > b.date) {
          return 1;
        }
        // 이름이 같을 경우
        return 0;
      });
      let last = data[data.length - 1];
      console.log(last);
      console.log(moment(last.date).unix(), end.unix());
      if (end.unix() - moment(last.date).unix() >= period) {
        resolve({
          data: data,
          upsert: { start: moment(last.date).unix() + period, end: end.unix() }
        });
      } else {
        resolve({ data: data, upsert: null });
      }
    });
  });
}

/**
 * return same period
 * @param target {moment}
 * @param period {int}
 * @return {object} - {start : moment, end: moment}
 */
function getSamePeriod(target, period) {
  // now에서 1period전까지
  let utcSec = target.unix();

  return {
    start: moment.unix(parseInt(utcSec / period) * period),
    end: moment.unix(parseInt(utcSec / period) * period + period - 0.001)
  };
}

/**
 * get chart data whatever future or past.
 * so use carefully
 * @param start {int} - utc sec timestamp
 * @param end  {int} - utc sec timestamp
 * @param period {int}
 * @param now {string | undefined} - 'YYYY-MM-DD'
 */
function getChartData(start, end, period, now = undefined) {
  return new Promise((resolve, reject) => {
    let samePeriod = getSamePeriod(moment(now), period);
    if (period === 86400) {
      if (start <= samePeriod.start.unix()) {
        // 시작 시간 과거
        if (end < samePeriod.end.unix()) {
          // 끝시간 과거
          Chart1D.findAll({
            where: {
              date: {
                [Op.between]: [
                  moment.unix(start).toISOString(),
                  moment.unix(end).toISOString()
                ]
              }
            }
          }).then(chart1ds => {
            resolve(chart1ds);
          });
        }
        // 끝시간 미래
        Chart1D.findAll({
          where: {
            date: {
              [Op.between]: [
                moment.unix(start).toISOString(),
                moment.unix(end).toISOString()
              ]
            }
          }
        }).then(chart1ds => {
          PredictChart.findAll({
            where: {
              date: {
                [Op.between]: [
                  samePeriod.end.toISOString(),
                  moment.unix(end).toISOString()
                ]
              },
              period: period
            }
          }).then(predicted => {
            let concated = chart1ds.concat(predicted);
            resolve(concated);
          });
        });
      } else {
        // 시작시간 미래
        PredictChart.findAll({
          where: {
            date: {
              [Op.between]: [
                moment.unix(start).toISOString(),
                moment.unix(end).toISOString()
              ]
            },
            period: period
          }
        }).then(predicted => {
          let concated = chart1ds.concat(predicted);
          resolve(concated);
        });
      }
    } else if (period === 1800) {
      if (start <= samePeriod.start.unix()) {
        // 시작 시간 과거
        if (end < samePeriod.end.unix()) {
          // 끝시간 과거
          Chart1D.findAll({
            where: {
              date: {
                [Op.between]: [
                  moment.unix(start).toISOString(),
                  moment.unix(end).toISOString()
                ]
              }
            }
          }).then(chart1ds => {
            resolve(chart1ds);
          });
        }
        // 끝시간 미래
        Chart30min.findAll({
          where: {
            date: {
              [Op.between]: [
                moment.unix(start).toISOString(),
                moment.unix(end).toISOString()
              ]
            }
          }
        }).then(chart1ds => {
          PredictChart.findAll({
            where: {
              date: {
                [Op.between]: [
                  samePeriod.end.toISOString(),
                  moment.unix(end).toISOString()
                ]
              },
              period: period
            }
          }).then(predicted => {
            let concated = chart1ds.concat(predicted);
            resolve(concated);
          });
        });
      } else {
        // 시작시간 미래
        PredictChart.findAll({
          where: {
            date: {
              [Op.between]: [
                moment.unix(start).toISOString(),
                moment.unix(end).toISOString()
              ]
            },
            period: period
          }
        }).then(predicted => {
          let concated = chart1ds.concat(predicted);
          resolve(concated);
        });
      }
    }
  });
}

/**
 * request ML server and upsert predcit data
 * @param date {object} - { start : int , end : int} utc timestamp
 * @param period
 */
function upsertPredictByDate(date, period) {
  let start = moment.unix(date.start);
  let end = moment.unix(date.end);
}

/**
 * parse to LTCM predict data
 * @param dbData
 */
function parseToLTCM(dbData) {}

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
