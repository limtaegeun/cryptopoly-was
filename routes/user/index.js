let express = require("express");
let router = express.Router();

const controller = require("./controller");
const validator = require("./validator");
router.post(
  "/signup",
  validator.signUpCheck,
  validator.signUpResult,
  controller.signUp
);

module.exports = router;
