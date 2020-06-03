"use strict";
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      email: DataTypes.STRING,
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      memberDueDate: DataTypes.DATE
    },
    {}
  );
  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.CreditCard);
  };
  return User;
};
