"use strict";
module.exports = (sequelize, DataTypes) => {
  const ChartData = sequelize.define(
    "ChartData",
    {
      date: {
        type: Sequelize.DATE,
        unique: true
      },
      high: DataTypes.FLOAT,
      low: DataTypes.FLOAT,
      open: DataTypes.FLOAT,
      close: DataTypes.FLOAT,
      volume: DataTypes.FLOAT,
      quoteVolume: DataTypes.FLOAT,
      weightedAverage: DataTypes.FLOAT
    },
    {}
  );
  ChartData.associate = function(models) {
    // associations can be defined here
    ChartData.belongsTo(models.Currency);
  };
  return ChartData;
};
