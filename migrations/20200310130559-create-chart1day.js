"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Chart1Ds", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      date: {
        type: Sequelize.DATE,
        unique: true
      },
      high: {
        type: Sequelize.DOUBLE
      },
      low: {
        type: Sequelize.DOUBLE
      },
      open: {
        type: Sequelize.DOUBLE
      },
      close: {
        type: Sequelize.DOUBLE
      },
      volume: {
        type: Sequelize.INTEGER
      },
      tradesCount: {
        type: Sequelize.INTEGER
      },
      CurrencyPairId: {
        type: Sequelize.INTEGER,
        references: {
          model: "CurrencyPairs", // name of Target model
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
    return queryInterface.dropTable("Chart1Ds");
  }
};
