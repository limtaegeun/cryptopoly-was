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
      let result = methods.samePeriod(moment("2020-04-01"), 86400);
      console.log(result.start.toISOString(true), result.end.toISOString(true));
      expect(
        result.start.toISOString() ===
          moment("2020-04-01")
            .startOf("day")
            .toISOString()
      ).to.be.true;
      expect(
        result.end.toISOString() ===
          moment("2020-04-01")
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
          console.log(result);
          expect(result.data).to.lengthOf(2);
          expect(result.upsert).to.eql("2일치");
        });
    });
  });
});
