"use strict";
module.exports = (sequelize, DataTypes) => {
  const Currency = sequelize.define(
    "Currency",
    {
      name: DataTypes.STRING(30),
      txFee: DataTypes.FLOAT,
      minConf: DataTypes.INTEGER
    },
    {}
  );
  Currency.associate = function(models) {
    // associations can be defined here
    Currency.hasMany(models.ChartData);
  };
  return Currency;
};
