"use strict";
module.exports = (sequelize, DataTypes) => {
  const PwdAuth = sequelize.define(
    "PwdAuth",
    {
      token: DataTypes.STRING(60),
      ttl: DataTypes.INTEGER,
      userId: DataTypes.INTEGER
    },
    {}
  );
  PwdAuth.associate = function(models) {
    // associations can be defined here
    PwdAuth.belongsTo(models.User);
  };
  return PwdAuth;
};
