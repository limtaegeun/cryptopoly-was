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
const async = require("async");

module.exports = {
  requestPredict,
  getSamePeriod,
  getPredictedAndToPredict,
  getChartData,
  parseToLTCM,
  upsertPredictByDate,
  getLengthOfPeriod,
  getTimeOfPeriod
};

/**
 * predict find and return what is need to update
 * @param start {moment}
 * @param end {moment}
 * @param period {int}
 * @param now {string | undefined} - 'YYYY-MM-DD'
 */
function getPredictedAndToPredict(start, end, period, now = undefined) {
  return new Promise((resolve, reject) => {
    let periodRange = getSamePeriod(moment(now), period);
    PredictChart.findAll({
      where: {
        date: {
          [Op.between]: [start.toISOString(), end.toISOString()]
        },
        period: period,
        updatedAt: {
          [Op.gt]: periodRange.start.toISOString()
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
      if (data.length < 1) {
        let timeOfPeriod = getTimeOfPeriod(start.unix(), end.unix(), period);
        resolve({
          data: null,
          upsert: { start: timeOfPeriod.start, end: end.unix() }
        });
        return;
      }
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
 * request ML server and upsert predict data
 * @param date {object} - Date range that need to upsert predict Data { start : int , end : int} utc timestamp
 * @param period {int}
 * @param pairId {int} - CurrencyPairId
 * @param now {string | undefined} - 'YYYY-MM-DD'
 */
function upsertPredictByDate(date, period, pairId, now = undefined) {
  return new Promise((resolve, reject) => {
    let start = moment.unix(date.start);
    // let end = moment.unix(date.end);

    // todo :  fix it use period
    let searchStart = start.clone().subtract(5, "days");
    let searchEnd = start.clone().subtract(1, "day");

    getChartData(searchStart.unix(), searchEnd.unix(), period, now).then(
      source => {
        // console.log(source);
        let parsedSource = parseToLTCM(source);
        let initCloser = callback => {
          requestPredict(parsedSource, period).then(predicted => {
            console.log("1", "source: ", parsedSource, "result :", predicted);
            callback(null, {
              predicted: predicted,
              source: parsedSource,
              acc: JSON.parse(predicted)
            });
          });
        };
        let task = [initCloser];
        let lengthOfPredict = getLengthOfPeriod(date.start, date.end, period);

        for (let i = 0; i < lengthOfPredict; i++) {
          let asyncCloser = (result, callback) => {
            // console.log(result);
            let source = JSON.parse(result.source)[0];
            source.splice(0, 1);
            source.push(JSON.parse(result.predicted)[0][0]);
            source = [source];
            requestPredict(JSON.stringify(source), period).then(predicted => {
              console.log(i + 2, "source: ", source, "result :", predicted);
              callback(null, {
                predicted: predicted,
                source: JSON.stringify(source),
                acc: result.acc.concat(JSON.parse(predicted))
              });
            });
          };
          task.push(asyncCloser);
        }
        // console.log(task);
        async.waterfall(task, (err, result) => {
          if (err) reject(err);
          let periodStart = getTimeOfPeriod(date.start, date.end, period).start;
          let createData = result.acc.map((item, idx) => {
            return {
              date: moment.unix(periodStart + period * idx),
              period: period,
              close: item,
              CurrencyPairId: pairId
            };
          });
          PredictChart.bulkCreate(createData, {
            fields: [
              "date",
              "period",
              "high",
              "low",
              "open",
              "close",
              "volume",
              "tradesCount",
              "CurrencyPairId"
            ],
            updateOnDuplicate: [
              "high",
              "low",
              "open",
              "close",
              "volume",
              "tradesCount"
            ]
          })
            .then(() => {
              resolve(createData);
            })
            .catch(err => {
              reject(err);
            });
        });
      }
    );
  });
}

/**
 * parse to LTCM predict data
 * @param dbData
 * @return {string} - stringify array : [[double]]
 */
function parseToLTCM(dbData) {
  return JSON.stringify([
    dbData.map(item => {
      return item.close;
    })
  ]);
}

/**
 * request to ML Server With LTCM parsed data
 * @param data {string} - LTCM parsed data that stringify double array : [[double]]
 * @param period {int}
 * @return {*}
 */
function requestPredict(data, period) {
  let form = { data: data };
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

/**
 * start 와 end 사이 period 개수 반환
 * @param start {int} - utc sec timestamp
 * @param end {int} - utc sec timestamp
 * @param period {int} - period by second
 */
function getLengthOfPeriod(start, end, period) {
  let periodStart = start + ((period - (start % period)) % period);
  let periodEnd = end - (start % period);
  return Math.abs((periodEnd - periodStart) / period);
}
/**
 * start 와 end 내부 period 양 끝 time 반환
 * @param start {int} - utc sec timestamp
 * @param end {int} - utc sec timestamp
 * @param period {int} - period by second
 * @return {object} - {start : int, end : int} utc sec timestamp data
 */
function getTimeOfPeriod(start, end, period) {
  let periodStart = start + ((period - (start % period)) % period);
  let periodEnd = end - (start % period);
  return { start: periodStart, end: periodEnd };
}

function getMLApiUrl() {
  if (process.env.NODE_ENV === "production") {
    return url.mlApi.prod;
  } else {
    return url.mlApi.local;
  }
}
