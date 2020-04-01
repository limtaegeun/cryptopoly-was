const express = require("express");
const router = express.Router();

const Currency = require("./currency");
const ChartData = require("./chartData");

router.use("/currency", Currency);
router.use("/chart", ChartData);

module.exports = router;
