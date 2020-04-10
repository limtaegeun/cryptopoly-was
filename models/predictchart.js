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
      high: {
        type: DataTypes.FLOAT
      },
      low: {
        type: DataTypes.FLOAT
      },
      open: {
        type: DataTypes.FLOAT
      },
      close: {
        type: DataTypes.FLOAT
      },
      volume: {
        type: DataTypes.FLOAT
      },
      tradesCount: {
        type: DataTypes.INTEGER
      }
    },
    {}
  );
  PredictChart.associate = function(models) {
    // associations can be defined here
    PredictChart.belongsTo(models.CurrencyPair);
  };
  return PredictChart;
};
