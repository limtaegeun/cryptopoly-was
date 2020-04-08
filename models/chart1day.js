"use strict";
module.exports = (sequelize, DataTypes) => {
  const Chart1D = sequelize.define(
    "Chart1D",
    {
      date: {
        type: DataTypes.DATE,
        unique: true
      },
      high: DataTypes.FLOAT,
      low: DataTypes.FLOAT,
      open: DataTypes.FLOAT,
      close: DataTypes.FLOAT,
      volume: DataTypes.FLOAT,
      tradesCount: DataTypes.INTEGER
    },
    {}
  );
  Chart1D.associate = function(models) {
    // associations can be defined here
    Chart1D.belongsTo(models.CurrencyPair);
  };
  return Chart1D;
};
