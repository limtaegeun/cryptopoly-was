const express = require("express");
const router = express.Router();

const Asset = require("./asset");
const ChartData = require("./chartData");

router.use("/asset", Asset);
router.use("/chart", ChartData);

module.exports = router;
