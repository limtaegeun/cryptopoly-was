import request from "supertest";
import { expect } from "chai";
var should = require("chai").should();
import app from "../app";
const moment = require("moment");
const sampleData = require("./sampleDataSet/sampleData");
const { ProductPage } = require("../models");
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
    it("should return expected predict data : getPredictedAndToPredict", function() {
      return methods
        .getPredictedAndToPredict(
          moment.utc("2020-04-01"),
          moment.utc("2020-04-05"),
          86400
        )
        .then(result => {
          // console.log(result);
          expect(result.data).to.lengthOf(3);
          expect(result.upsert).to.eql({
            start: moment.utc("2020-04-04").unix(),
            end: moment.utc("2020-04-05").unix()
          });
        });
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
        moment.utc("2020-04-08").unix(),
        86400
      );
      console.log("result:", result);
      result.start.should.equal(moment.utc("2020-04-04").unix());
      result.end.should.equal(moment.utc("2020-04-08").unix());
    });
    it("should return expected predict data: requestWithDate", function() {
      this.timeout(10000);
      return methods
        .upsertPredictByDate(
          {
            start: moment.utc("2020-04-04").unix(),
            end: moment.utc("2020-04-08").unix()
          },
          86400,
          1,
          "2020-04-01T02"
        )
        .then(result => {
          console.log(result);
          result.should.have.lengthOf(5);
        });
    });
  });
});
