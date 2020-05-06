"use strict";
module.exports = (sequelize, DataTypes) => {
  const PredictChart = sequelize.define(
    "PredictChart",
    {
      date: {
        type: DataTypes.DATE,
        allowNull: false,
        primaryKey: true
      },
      period: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
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
  PredictChart.associate = function(models) {
    // associations can be defined here
    PredictChart.belongsTo(models.CurrencyPair);
  };
  return PredictChart;
};
