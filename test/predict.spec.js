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
          moment("2020-04-01")
            .utc()
            .startOf("day")
            .toISOString()
      ).to.be.true;
      expect(
        result.end.toISOString() ===
          moment("2020-04-01")
            .utc()
            .endOf("day")
            .toISOString()
      ).to.be.true;
    });
    it("should return expected predict data : getPredictedAndToPredict", function() {
      return methods
        .getPredictedAndToPredict(
          moment("2020-04-01"),
          moment("2020-04-05"),
          86400
        )
        .then(result => {
          // console.log(result);
          expect(result.data).to.lengthOf(3);
          expect(result.upsert).to.eql({
            start: moment("2020-04-04").unix(),
            end: moment("2020-04-05").unix()
          });
        });
    });
    describe("request ML predict methods", function() {
      let resultOfgetChartData;
      it("should return expected chart data :getChartData ", function() {
        return methods
          .getChartData(
            moment("2020-03-30").unix(),
            moment("2020-04-03").unix(),
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
        result.should.eql([[6393.92, 6410.98, 6644, 6656, 6890]]);
      });
    });
    it("should return expected predict data: requestWithDate", function() {
      return methods
        .upsertPredictByDate(
          {
            start: moment("2020-04-04").unix(),
            end: moment("2020-04-08").unix()
          },
          86400
        )
        .then(result => {
          console.log(result);
          result.should.hae.lengthOf(5);
        });
    });
  });
});
