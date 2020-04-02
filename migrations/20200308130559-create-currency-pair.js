"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("CurrencyPairs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      currencyPair: {
        type: Sequelize.STRING(20)
      },
      baseID: { type: Sequelize.STRING(10) },
      quoteID: { type: Sequelize.STRING(10) },
      enable: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      AssetId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Assets", // name of Target model
          key: "id" // key in Target model that we're referencing
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("CurrencyPairs");
  }
};
