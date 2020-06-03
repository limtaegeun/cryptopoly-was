"use strict";
module.exports = (sequelize, DataTypes) => {
  const CreditCard = sequelize.define(
    "CreditCard",
    {
      number: DataTypes.STRING,
      name: DataTypes.STRING,
      password: DataTypes.STRING,
      cvc: DataTypes.STRING,
      validThru: DataTypes.STRING
    },
    {}
  );
  CreditCard.associate = function(models) {
    // associations can be defined here
    CreditCard.belongsTo(models.User);
  };
  return CreditCard;
};
