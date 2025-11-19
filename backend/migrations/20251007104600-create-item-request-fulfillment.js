'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ItemRequestFulfillment', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      RequestId: {
        type: Sequelize.INTEGER,
        references: {
          model: "RequestLog",
          key: "Id"
        }
      },
      ProcurementId: {
        type: Sequelize.INTEGER,
        references: {
          model: "ProcurementLog",
          key: "Id"
        }
      },
      BatchNumber: {
        type: Sequelize.STRING
      },
      Quantity: {
        type: Sequelize.INTEGER
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ItemRequestFulfillment');
  }
};