'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProcurementLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ParticularDescription: {
        type: Sequelize.INTEGER
      },
      TransactionId: {
        type: Sequelize.INTEGER
      },
      BatchNumber: {
        type: Sequelize.STRING
      },
      UnitCost: {
        type: Sequelize.FLOAT
      },
      Quantity: {
        type: Sequelize.INTEGER
      },
      ExpiryDate: {
        type: Sequelize.DATE
      },
      Remarks: {
        type: Sequelize.STRING
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ProcurementLogs');
  }
};