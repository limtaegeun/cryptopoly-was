"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      email: DataTypes.STRING(50),
      username: DataTypes.STRING(20),
      password: DataTypes.STRING(70),
      salt: DataTypes.STRING(70),
      plan: DataTypes.STRING(10),
      memberDueDate: DataTypes.DATE
    },
    {}
  );
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.CreditCard);
    User.hasMany(models.PwdAuth);
  };
  return User;
};
