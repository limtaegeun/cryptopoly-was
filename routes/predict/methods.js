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
const chartMethods = require("../chartData/methods");
const seqh = require("../../plugin/sequelizeHelper");

module.exports = {
  requestPredict,
  getSamePeriod,
  getPredictedAndToPredict,
  getChartData,
  parseToLTCM,
  upsertPredictByDate,
  getLengthOfPeriod,
  getTimeOfPeriod,
  getUnconfirmedDates,
  getPastPredictData,
  getSourceData
};

/**
 * get Confirm Past Predict Data
 * if there are not confirmed, it predict data using real data
 * @param start {moment.Moment}
 * @param end {moment}
 * @param period {int}
 * @param pairId {int} - CurrencyPairId
 * @param now {string | undefined} - 'YYYY-MM-DD'
 */
function getPastPredictData(start, end, period, pairId) {
  return new Promise(resolve => {
    getConfirmedPredictData(start, end).then(confirmed => {
      let timeOfPeriod = getTimeOfPeriod(start.unix(), end.unix(), period);
      let lengthOfExpectConfirmedData =
        timeOfPeriod.end - timeOfPeriod.start / period + 1;
      if (confirmed.length === lengthOfExpectConfirmedData) {
        return confirmed;
      } else {
        newPredictByUnconfirmedDate(
          timeOfPeriod,
          confirmed,
          period,
          pairId
        ).then(result => {
          resolve(result);
        });
      }
    });
  });
}

/**
 * getConfirmedPredictData
 * @param start {moment}
 * @param end {moment}
 * @return {Promise<Model[]>}
 */
function getConfirmedPredictData(start, end) {
  return PredictChart.findAll({
    where: {
      date: {
        [Op.between]: [start.toISOString(), end.toISOString()]
      },
      confirm: 1
    }
  });
}

/**
 * newPredictByUnconfirmedDate
 * @param timeOfPeriod {Object} - start , end 를 period단위로 변환한 객체
 * @param confirmed {[Object]} - confirmed Data : 실데이터로 예측한 값들
 * @param period {int} - period Of predict
 * @param pairId {int} - CurrencyPairId
 * @return {Promise<Object>}
 */
function newPredictByUnconfirmedDate(timeOfPeriod, confirmed, period, pairId) {
  return new Promise(resolve => {
    let unconfirmedDates = getUnconfirmedDates(
      timeOfPeriod.start,
      timeOfPeriod.end,
      period,
      confirmed
    ).sort((a, b) => a - b);
    // console.log("unconfirmDates :", unconfirmedDates);
    getSourceToPredictUnconfirmed(unconfirmedDates, period).then(source => {
      // seqh.logOfInstance(source, "source Data");
      requestAllUnconfirmedDates(source, unconfirmedDates, period)
        .then(newPredictList => {
          let upsertData = newPredictList.map((value, i) => {
            return {
              date: moment.unix(unconfirmedDates[i]).toISOString(),
              period: period,
              close: value[0][0],
              CurrencyPairId: pairId,
              confirm: true
            };
          });
          // console.log("upsertData :", upsertData);
          let dataOfConfirmedAndNewPredict = confirmed.concat(upsertData);
          resolve(dataOfConfirmedAndNewPredict);

          return upsertNewPredictData(upsertData);
        })
        .catch(err => {
          // todo: report Error
          console.log("Error Occur in upsert Predicted Data");
        });
    });
  });
}

/**
 * get UnConfirmed dates between start and end
 * @param start {int} - utc sec timestamp
 * @param end {int} - utc sec timestamp
 * @param period {int} - time period sec
 * @param confirmed {[object]} - confirmed data from PredictChart
 * @return {[int]} -  unconfirmed date that is utc unix
 */
function getUnconfirmedDates(start, end, period, confirmed) {
  let timeOfPeriod = getTimeOfPeriod(start, end, period);
  let confirmedDate = confirmed.map(item => moment.utc(item.date).unix());
  let unconfirmedDates = [];
  for (
    let timestamp = timeOfPeriod.start;
    timestamp <= timeOfPeriod.end;
    timestamp += period
  ) {
    console.log(timestamp);
    if (!confirmedDate.includes(timestamp)) {
      unconfirmedDates.push(timestamp);
    }
  }
  return unconfirmedDates;
}

/**
 * getSourceToPredictUnconfirmed
 * @param unconfirmedDates {[Object]} - unconfirmedDates
 * @param period {int} - period
 * @return {Promise<Object>}
 */
function getSourceToPredictUnconfirmed(unconfirmedDates, period) {
  let sourceSearchStart = moment.unix(unconfirmedDates[0] - period * 5);
  let sourceSearchEnd = moment.unix(
    unconfirmedDates[unconfirmedDates.length - 1] - period * 1
  );
  return chartMethods.selectChartModel(period).findAll({
    where: {
      date: {
        [Op.between]: [
          sourceSearchStart.toISOString(),
          sourceSearchEnd.toISOString()
        ]
      }
    }
  });
}

/**
 * unconfirmed 로 새로 예측된 데이터를 upsert한다.
 * @param upsertData
 * @return {Promise<PredictChart[]>}
 */
function upsertNewPredictData(upsertData) {
  return PredictChart.bulkCreate(upsertData, {
    fields: [
      "date",
      "period",
      "high",
      "low",
      "open",
      "close",
      "volume",
      "tradesCount",
      "CurrencyPairId",
      "confirm",
      "updatedAt"
    ],
    updateOnDuplicate: [
      "high",
      "low",
      "open",
      "close",
      "volume",
      "tradesCount",
      "confirm",
      "updatedAt"
    ]
  });
}

/**
 * requestAllUnconfirmDates
 * @param source
 * @param unconfirmedDates
 * @param period
 * @return {Promise<Object>}
 */
function requestAllUnconfirmedDates(source, unconfirmedDates, period) {
  return new Promise(resolve => {
    let asyncPredictList = unconfirmedDates.map(dateOfUnix => {
      return new Promise((resolve, reject) => {
        let sourceToPredict = getSourceData(dateOfUnix, source, 5, period);
        let ltcmSource = parseToLTCM(sourceToPredict);
        requestPredict(ltcmSource, period).then(predicted => {
          // console.log("source: ", ltcmSource, "result :", predicted);
          resolve(JSON.parse(predicted));
        });
      });
    });
    Promise.all(asyncPredictList).then(result => {
      resolve(result);
    });
  });
}

/**
 *
 * @param targetDate {int} - utc sec timestamp
 * @param source {[object]} - source data from Chart Table
 * @param length {int} - length of source
 * @param period {int} - time period sec
 */
function getSourceData(targetDate, source, length, period) {
  return source.filter(el => {
    let sourceStart = targetDate - length * period;
    let sourceEnd = targetDate - 1 * period;
    let unixOfEl = moment.utc(el.date).unix();
    return unixOfEl >= sourceStart && unixOfEl <= sourceEnd;
  });
}

/**
 * find and return data and date what is need to update to predict by predicted data
 * 예측값에 의한 예측은 이전 예측값이 변동되므로 현재 시각부터 end에 해당하는 시각까지 모든 예측값이 빠짐없이 최신으로
 * 업데이트 되어야함
 * @param start {moment.Moment}
 * @param end {moment.Moment}
 * @param period {int}
 * @param now {string | undefined} - 'YYYY-MM-DD'
 */
function getPredictedAndToPredict(start, end, period, now = undefined) {
  return new Promise((resolve, reject) => {
    let periodRange = getSamePeriod(moment.utc(now), period);
    PredictChart.findAll({
      where: {
        date: {
          [Op.between]: [periodRange.start.toISOString(), end.toISOString()]
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
        } else if (a.date > b.date) {
          return 1;
        } else {
          return 0;
        }
      });
      console.log(data);
      if (data.length < 1) {
        let timeOfPeriod = getTimeOfPeriod(start.unix(), end.unix(), period);
        resolve({
          data: [],
          upsert: { start: timeOfPeriod.start, end: end.unix() }
        });
        return;
      }
      let last = data[data.length - 1];
      // console.log(last);
      // console.log(moment(last.date).unix(), end.unix());
      if (end.unix() - moment(last.date).unix() >= period) {
        resolve({
          data: data,
          upsert: {
            start: Number(moment(last.date).unix()) + Number(period),
            end: end.unix()
          }
        });
      } else {
        resolve({ data: data, upsert: null });
      }
    });
  });
}

/**
 * return same period
 * @param target {moment.Moment}
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
  console.log("getChartData");
  return new Promise((resolve, reject) => {
    let samePeriod = getSamePeriod(moment(now), period);
    // console.log("samePeriod", samePeriod);
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
        } else {
          // 끝시간 미래
          console.log("end is future");
          Chart1D.findAll({
            where: {
              date: {
                [Op.between]: [
                  moment.unix(start).toISOString(),
                  samePeriod.start.toISOString()
                ]
              }
            }
          }).then(chart1ds => {
            console.log(chart1ds);
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
        }
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
          resolve(predicted);
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
        } else {
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
        }
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
          resolve(predicted);
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
  console.log("upsertPredictByDate");
  return new Promise((resolve, reject) => {
    let start = moment.unix(date.start);
    // let end = moment.unix(date.end);

    // todo :  fix it use period
    let searchStart = start.clone().subtract(5, "days");
    let searchEnd = start.clone().subtract(1, "day");

    getChartData(searchStart.unix(), searchEnd.unix(), period, now).then(
      source => {
        seqh.logOfInstance(source, "source");
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
              date: moment.unix(periodStart + period * idx).toISOString(),
              period: period,
              close: item[0],
              CurrencyPairId: pairId
            };
          });
          seqh.logOfInstance(createData, "result");
          resolve(createData);
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
              "CurrencyPairId",
              "updatedAt"
            ],
            updateOnDuplicate: [
              "high",
              "low",
              "open",
              "close",
              "volume",
              "tradesCount",
              "updatedAt"
            ]
          }).catch(err => {
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
 * @return {Promise<string>}
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
 *
 * start 와 end 내부 period 양 끝 time 반환
 * @param start {int} - utc sec timestamp
 * @param end {int} - utc sec timestamp
 * @param period {int} - period by second
 * @return {{start: number, end: number}}
 */
function getTimeOfPeriod(start, end, period) {
  let periodStart = start + ((period - (start % period)) % period);
  let periodEnd = end - (end % period);
  return { start: periodStart, end: periodEnd };
}

function getMLApiUrl() {
  if (process.env.NODE_ENV === "production") {
    return url.mlApi.prod;
  } else {
    return url.mlApi.local;
  }
}
