const LocalStrategy = require("passport-local").Strategy;
const crypto = require("crypto");
const { User } = require("./models");
const pwdConfig = require("./config/crypto.json");

exports.config = passport => {
  passport.serializeUser((user, done) => {
    // Strategy 성공 시 호출됨 로그인 성공시 세션에 저장
    console.log("serializeUser:", user.email, user.id);
    done(null, user.id); // 여기의 user가 deserializeUser의 첫 번째 매개변수로 이동
  });

  passport.deserializeUser((id, done) => {
    // 요청마다 req.user 넘겨줌. 매개변수 user는 serializeUser의 done의 인자 user를 받은 것
    console.log("deserializeUser : ", id);
    User.findByPk(id).then(user => {
      done(null, user); // 여기의 user가 req.user가 됨
    });
  });

  passport.use(
    new LocalStrategy(
      {
        // local 전략을 세움
        usernameField: "email",
        passwordField: "password",
        session: true, // 세션에 저장 여부
        passReqToCallback: true
      },
      (req, email, password, done) => {
        console.log(email, password);
        User.findOne({ where: { email: email } })
          .then(user => {
            console.log(user.email);
            if (!user) {
              return done(null, false, {
                message: "존재하지 않는 아이디입니다"
              }); // 임의 에러 처리
            }
            comparePassword(user, password, (passError, isMatch) => {
              if (isMatch) {
                return done(null, user); // 검증 성공
              }
              return done(null, false, { message: "비밀번호가 틀렸습니다" }); // 임의 에러 처리
            });
          })
          .catch(err => {
            console.log(err);
            if (err) return done(err); // 서버 에러 처리
          });
      }
    )
  );
};

function comparePassword(user, password, callback) {
  crypto.pbkdf2(
    password,
    user.salt,
    pwdConfig.pwd.iterations,
    pwdConfig.pwd.keylen,
    pwdConfig.pwd.digest,
    (err, key) => {
      const hashedPwd = key.toString("base64");
      console.log(hashedPwd);
      if (user.password === hashedPwd) {
        callback(null, true);
      } else {
        callback("unMatch", null);
      }
    }
  );
}
