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
        JobTitle: "Medical Technologist III"
      },
      {
        Name: "Jane Doe",
        Email: "jane@email.com",
        Password: "staff",
        Role: "Staff",
        JobTitle: "Medical Technologist II"
      },
      {
        Name: "Joe Doe",
        Email: "joe@email.com",
        Password: "staff",
        Role: "Staff",
        JobTitle: "Medical Technologist II"
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
