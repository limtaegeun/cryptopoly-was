"use strict";
module.exports = (sequelize, DataTypes) => {
  const Chart30min = sequelize.define(
    "Chart30min",
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
  Chart30min.associate = function(models) {
    // associations can be defined here
  };
  return Chart30min;
};
