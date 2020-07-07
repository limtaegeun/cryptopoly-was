"use strict";
const {
  Currency,
  CurrencyPair,
  Chart1D,
  Chart30min,
  PredictChart,
  PwdAuth
} = require("../../models");
const moment = require("moment");
const rp = require("request-promise");
const url = require("../../constant/url.json");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const async = require("async");
const crypto = require("crypto");
const pwdConfig = require("./../../config/crypto.json");

module.exports = {
  genPwdAuthKey,
  sendEmail
};

async function genPwdAuthKey(userId) {
  const token = crypto.randomBytes(20).toString("hex"); // token 생성
  const data = {
    // 데이터 정리
    token,
    userId: userId,
    ttl: 300 // ttl 값 설정 (5분)
  };
  return await PwdAuth.create(data);
}

function sendEmail(from, to, subject, content) {
  let options = {
    method: "POST",
    url: "https://rapidprod-sendgrid-v1.p.rapidapi.com/mail/send",
    headers: {
      "x-rapidapi-host": "rapidprod-sendgrid-v1.p.rapidapi.com",
      "x-rapidapi-key": "f9ef75b6f3msh86aeaaff5246ad9p12df2ajsneb75f0f69f35",
      "content-type": "application/json",
      accept: "application/json",
      useQueryString: true
    },
    body: {
      personalizations: [{ to: [{ email: to }], subject: subject }],
      from: { email: from },
      content: [{ type: "text/plain", value: content }]
    },
    json: true
  };

  return rp(options);
}
