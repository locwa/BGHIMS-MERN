'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add Category column to Particulars table
    await queryInterface.addColumn('Particulars', 'Category', {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: 'Unit'
    });

    // Add Year column to ProcurementLog table
    await queryInterface.addColumn('ProcurementLog', 'Year', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'Remarks'
    });

    // Add Quarter column to ProcurementLog table
    await queryInterface.addColumn('ProcurementLog', 'Quarter', {
      type: Sequelize.STRING(10),
      allowNull: true,
      after: 'Year'
    });

    // Add indexes for better performance
    await queryInterface.addIndex('Particulars', ['Category'], {
      name: 'idx_category'
    });

    await queryInterface.addIndex('ProcurementLog', ['Year', 'Quarter'], {
      name: 'idx_year_quarter'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes
    await queryInterface.removeIndex('Particulars', 'idx_category');
    await queryInterface.removeIndex('ProcurementLog', 'idx_year_quarter');

    // Remove columns
    await queryInterface.removeColumn('Particulars', 'Category');
    await queryInterface.removeColumn('ProcurementLog', 'Year');
    await queryInterface.removeColumn('ProcurementLog', 'Quarter');
  }
};