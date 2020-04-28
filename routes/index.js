const express = require("express");
const router = express.Router();

const Asset = require("./asset");
const ChartData = require("./chartData");
const Predict = require("./predict");

router.use("/asset", Asset);
router.use("/chart", ChartData);
router.use("/predict", Predict);

module.exports = router;
