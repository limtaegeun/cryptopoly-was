"use strict";
module.exports = (sequelize, DataTypes) => {
  const CurrencyPair = sequelize.define(
    "CurrencyPair",
    {
      currencyPair: DataTypes.STRING(20),
      baseID: DataTypes.STRING(10),
      quoteID: DataTypes.STRING(10),
      enable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      }
    },
    {}
  );
  CurrencyPair.associate = function(models) {
    // associations can be defined here
    CurrencyPair.hasMany(models.Chart1D);
    CurrencyPair.hasMany(models.Chart30min);
    CurrencyPair.belongsTo(models.Asset);
  };
  return CurrencyPair;
};
