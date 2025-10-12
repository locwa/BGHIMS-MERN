'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProcurementLog', {
      Id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ParticularDescription: {
        type: Sequelize.INTEGER,
        references: {
          model: "Particulars",
          key: "Id"
        }
      },
      TransactionId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Transactions",
          key: "Id"
        }
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
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ProcurementLog');
  }
};