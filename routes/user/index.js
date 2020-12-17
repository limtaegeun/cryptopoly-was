let express = require("express");
let router = express.Router();
const passport = require("passport");

const controller = require("./controller");
const validator = require("./validator");

router.get("/check", controller.loginCheck);
router.post("/login", passport.authenticate("local"), controller.login);
router.get("/logout", controller.logout);
router.post(
  "/signup",
  validator.signUpCheck,
  validator.signUpResult,
  controller.signUp
);

module.exports = router;
