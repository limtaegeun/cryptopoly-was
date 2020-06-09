var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var bodyParser = require("body-parser");
var cors = require("cors");

var routes = require("./routes");
var app = express();
var compression = require("compression");
const session = require("express-session");
const passport = require("passport");
const passportConfig = require("./passport");
const sessionKey = require("./config/session.json");
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(compression());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(
  cors({
    origin: [/\localhost:[0-9]+$/, /\.cryptoply\.com$/, /cryptoply\.com$/]
  })
);

app.use(
  session({ secret: sessionKey.secret, resave: true, saveUninitialized: false })
); // 세션 활성화
app.use(passport.initialize()); // passport 구동
app.use(passport.session()); // 세션 연결
passportConfig(); // 이 부분 추가

console.log("port: ", process.env.PORT, "mode: ", process.env.NODE_ENV);

app.use("/", routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
