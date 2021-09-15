"use strict";
module.exports = (sequelize, DataTypes) => {
  const Chart1D = sequelize.define(
    "Chart1D",
    {
      date: {
        type: DataTypes.DATE,
        unique: true
      },
      high: DataTypes.DOUBLE,
      low: DataTypes.DOUBLE,
      open: DataTypes.DOUBLE,
      close: DataTypes.DOUBLE,
      volume: DataTypes.INTEGER,
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
