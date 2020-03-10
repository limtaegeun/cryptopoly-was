"use strict";
module.exports = (sequelize, DataTypes) => {
  const CurrencyPair = sequelize.define(
    "CurrencyPair",
    {
      currencyPair: DataTypes.STRING,
      enable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {}
  );
  CurrencyPair.associate = function(models) {
    // associations can be defined here
    CurrencyPair.hasMany(models.ChartData);
    CurrencyPair.belongsTo(models.Currency);
  };
  return CurrencyPair;
};
