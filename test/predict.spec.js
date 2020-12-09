import request from "supertest";
import { expect } from "chai";
var should = require("chai").should();
import app from "../app";
const moment = require("moment");
const sampleData = require("./sampleDataSet/sampleData");
const { PredictChart } = require("../models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

import methods from "../routes/predict/methods";

describe("predict test", function() {
  describe("methods test", function() {
    it("should return samePeriod", function() {
      let result = methods.getSamePeriod(moment("2020-04-01T05"), 86400);
      console.log(result.start.toISOString(), result.end.toISOString());
      expect(
        result.start.toISOString() ===
          moment
            .utc("2020-04-01")
            .utc()
            .startOf("day")
            .toISOString()
      ).to.be.true;
      expect(
        result.end.toISOString() ===
          moment
            .utc("2020-04-01")
            .utc()
            .endOf("day")
            .toISOString()
      ).to.be.true;
    });

    describe("request ML predict methods", function() {
      let resultOfgetChartData;
      it("should return expected chart data :getChartData ", function() {
        return methods
          .getChartData(
            moment.utc("2020-03-30").unix(),
            moment.utc("2020-04-03").unix(),
            86400,
            "2020-04-01T02"
          )
          .then(result => {
            console.log(result);
            resultOfgetChartData = result;
            result.should.have.lengthOf(5);
          });
      });
      it("parse to LTCM predict data", function() {
        let result = methods.parseToLTCM(resultOfgetChartData);
        console.log(result);
        result.should.eql(
          "[[6393.91728904,6410.98220921,6643.99644607,6656,6890]]"
        );
      });
    });
    it("should return expected length of period : getLengthOfPeriod ", function() {
      let result = methods.getLengthOfPeriod(
        moment.utc("2020-04-03T04").unix(),
        moment.utc("2020-04-08").unix(),
        86400
      );
      console.log("result:", result);
      result.should.equal(4);
    });
    it("should return expected time of period : getTimeOfPeriod ", function() {
      let result = methods.getTimeOfPeriod(
        moment.utc("2020-04-04").unix(),
        moment.utc("2020-04-08").unix() + 300,
        86400
      );
      console.log("result:", result);
      result.start.should.equal(moment.utc("2020-04-04").unix());
      result.end.should.equal(moment.utc("2020-04-08").unix());
    });

    it("should return expected date array : getUnConfirmDate", function() {
      let confirmed = [
        { date: "2020-08-02" },
        { date: "2020-08-03" },
        { date: "2020-08-06" },
        { date: "2020-08-09" }
      ];
      let unconfirmedDates = methods.getUnconfirmedDates(
        moment.utc("2020-08-01").unix(),
        moment.utc("2020-08-10").unix(),
        86400,
        confirmed
      );
      console.log(unconfirmedDates.map(el => moment.unix(el).toISOString()));
      unconfirmedDates.should.have.lengthOf(6);
    });

    it("should return expect 5 source Data : getSourceData", function() {
      let target = moment.utc("2020-08-07").unix();
      let source = [
        { date: "2020-08-01" },
        { date: "2020-08-02" },
        { date: "2020-08-03" },
        { date: "2020-08-04" },
        { date: "2020-08-05" },
        { date: "2020-08-05" },
        { date: "2020-08-06" },
        { date: "2020-08-07" },
        { date: "2020-08-08" }
      ];
      let result = methods.getSourceData(target, source, 5, 86400);
      result.should.have.lengthOf(5);
      result.should.be.eql([
        { date: "2020-08-03" },
        { date: "2020-08-04" },
        { date: "2020-08-05" },
        { date: "2020-08-05" },
        { date: "2020-08-06" }
      ]);
    });

    it("should return expect predicted Data : getConfirmPastPredictData", function() {
      let start = moment.utc("2020-11-10");
      let deleteStart = moment.utc("2020-11-15");
      let end = moment.utc("2020-11-18");
      let period = 86400;
      let pairId = 1;
      return PredictChart.findAll({
        where: {
          date: {
            [Op.between]: [deleteStart.toISOString(), end.toISOString()]
          }
        }
      })
        .then(result => {
          let mapDestroy = result.map(item => {
            return item.destroy();
          });
          return Promise.all(mapDestroy);
        })
        .then(() => {
          return methods.getPastPredictData(start, end, period, pairId);
        })
        .then(results => {
          console.log(results);
          results.should.be.lengthOf(9);
        });
    });
    it("should return expected predict data : getPredictedAndToPredict", function() {
      return methods
        .getPredictedAndToPredict(
          moment.utc("2020-08-23"),
          moment.utc("2020-08-29"),
          86400,
          "2020-08-23"
        )
        .then(result => {
          // console.log(result);
          expect(result.data).to.lengthOf(1);
          expect(result.upsert).to.eql({
            start: moment.utc("2020-08-24").unix(),
            end: moment.utc("2020-08-29").unix()
          });
        });
    });
    it("when predict data is null : getPredictedAndToPredict", function() {
      return methods
        .getPredictedAndToPredict(
          moment.utc("2020-08-26"),
          moment.utc("2020-08-29"),
          86400,
          "2020-08-23"
        )
        .then(result => {
          // console.log(result);
          expect(result.data).is.null;
          expect(result.upsert).to.eql({
            start: moment.utc("2020-08-24").unix(),
            end: moment.utc("2020-08-29").unix()
          });
        });
    });
    it("should predict from future source Data : upsertPredictByDate", function() {
      let start = moment.utc("2020-08-24");
      let end = moment.utc("2020-08-29");
      let period = 86400;
      let pairId = 1;
      return PredictChart.findAll({
        where: {
          date: {
            [Op.between]: [start.toISOString(), end.toISOString()]
          }
        }
      })
        .then(result => {
          let mapDestroy = result.map(item => {
            return item.destroy();
          });
          return Promise.all(mapDestroy);
        })
        .then(() => {
          return methods.upsertPredictByDate(
            { start: start.unix(), end: end.unix() },
            period,
            pairId,
            "2020-08-23"
          );
        })
        .then(result => {
          result.should.be.lengthOf(6);
        });
    });
  });
});
