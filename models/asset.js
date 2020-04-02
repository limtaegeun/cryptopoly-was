"use strict";
module.exports = (sequelize, DataTypes) => {
  const Asset = sequelize.define(
    "Asset",
    {
      code: {
        type: DataTypes.STRING(10),
        unique: true
      },
      name: DataTypes.STRING(30),
      txFee: DataTypes.FLOAT,
      isCrypto: DataTypes.BOOLEAN,
      dataStart: DataTypes.DATE,
      dataEnd: DataTypes.DATE,
      minConf: DataTypes.INTEGER
    },
    {}
  );
  Asset.associate = function(models) {
    // associations can be defined here
    Asset.hasMany(models.CurrencyPair);
  };
  return Asset;
};
