'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    await queryInterface.bulkInsert('UserAccounts', [
      {
        Name: "John Doe",
        Email: "jdoe@email.com",
        Password: "admin",
        Role: "Admin",
        JobTitle: "Medical Technologist III",
          IsActive: true
      },
      {
        Name: "Jane Doe",
        Email: "jane@email.com",
        Password: "staff",
        Role: "Staff",
        JobTitle: "Medical Technologist II",
          IsActive: true

      },
      {
        Name: "Joe Doe",
        Email: "joe@email.com",
        Password: "staff",
        Role: "Staff",
        JobTitle: "Medical Technologist II",
          IsActive: true
      },
    ])
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete('UserAccounts', null, {});
  }
};
