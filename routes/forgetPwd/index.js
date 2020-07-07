let express = require("express");
let router = express.Router();
const passport = require("passport");

const controller = require("./controller");
const validator = require("./validator");

router.post(
  "/issueAuth",
  validator.check,
  validator.result,
  controller.issueAuthenticationKey
);
router.get("/email", controller.sendEmail);

module.exports = router;
