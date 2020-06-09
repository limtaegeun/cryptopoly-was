const express = require("express");
const router = express.Router();

const Asset = require("./asset");
const ChartData = require("./chartData");
const Predict = require("./predict");
const User = require("./user");

router.use("/asset", Asset);
router.use("/chart", ChartData);
router.use("/predict", Predict);
router.use("/user", User);

module.exports = router;
