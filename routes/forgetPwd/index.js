let express = require("express");
let router = express.Router();
const passport = require("passport");

const controller = require("./controller");
const validator = require("./validator");

router.post(
  "/auth",
  validator.check,
  validator.result,
  controller.issueAuthenticationKey
);
router.post("/reset", controller.resetPassword);

module.exports = router;
