"use strict";
module.exports = (sequelize, DataTypes) => {
  const Chart30min = sequelize.define(
    "Chart30min",
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
  Chart30min.associate = function(models) {
    // associations can be defined here
  };
  return Chart30min;
};
