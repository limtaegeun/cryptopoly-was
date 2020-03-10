"use strict";
module.exports = (sequelize, DataTypes) => {
  const Currency = sequelize.define(
    "Currency",
    {
      code: {
        type: DataTypes.STRING(10),
        unique: true
      },
      name: DataTypes.STRING(30),
      txFee: DataTypes.FLOAT,
      minConf: DataTypes.INTEGER
    },
    {}
  );
  Currency.associate = function(models) {
    // associations can be defined here
    Currency.hasMany(models.CurrencyPair);
  };
  return Currency;
};
