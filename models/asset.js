"use strict";
module.exports = (sequelize, DataTypes) => {
  const Asset = sequelize.define(
    "Asset",
    {
      code: {
        type: DataTypes.STRING(20),
        unique: true
      },
      name: DataTypes.STRING(30),
      icon: DataTypes.STRING,
      isCrypto: DataTypes.BOOLEAN,
      dataStart: DataTypes.DATE,
      dataEnd: DataTypes.DATE
    },
    {}
  );
  Asset.associate = function(models) {
    // associations can be defined here
    Asset.hasMany(models.CurrencyPair);
  };
  return Asset;
};
