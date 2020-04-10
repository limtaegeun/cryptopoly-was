"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("PredictCharts", {
      date: {
        type: Sequelize.DATE,
        allowNull: false,
        primaryKey: true
      },
      period: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true
      },
      high: {
        type: Sequelize.FLOAT
      },
      low: {
        type: Sequelize.FLOAT
      },
      open: {
        type: Sequelize.FLOAT
      },
      close: {
        type: Sequelize.FLOAT
      },
      volume: {
        type: Sequelize.FLOAT
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
    return queryInterface.dropTable("PredictCharts");
  }
};
