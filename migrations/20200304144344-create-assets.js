"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Assets", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      code: {
        type: Sequelize.STRING(10),
        unique: true
      },
      name: {
        type: Sequelize.STRING(30)
      },
      icon: {
        type: Sequelize.STRING
      },
      isCrypto: {
        type: Sequelize.BOOLEAN
      },
      dataStart: { type: Sequelize.DATE },
      dataEnd: { type: Sequelize.DATE },
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
    return queryInterface.dropTable("Assets");
  }
};
