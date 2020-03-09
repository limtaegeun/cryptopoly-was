const express = require("express");
const router = express.Router();

const Currency = require("./currency");

router.use("/currency", Currency);

module.exports = router;
