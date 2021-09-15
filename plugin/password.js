const crypto = require("crypto");
const pwdConfig = require("../config/crypto.json");

export function comparePassword(user, password, callback) {
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
