"use strict";
module.exports = (sequelize, DataTypes) => {
  const PwdAuth = sequelize.define(
    "PwdAuth",
    {
      token: DataTypes.STRING,
      ttl: DataTypes.INTEGER
    },
    {}
  );
  PwdAuth.associate = function(models) {
    // associations can be defined here
    PwdAuth.belongsTo(models.User);
  };
  return PwdAuth;
};
