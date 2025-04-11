'use strict';


const roles = [
  { value: 'ADMIN', description: 'Администратор' },
  { value: 'USER', description: 'Пользователь' },
]

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("roles", roles)

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('roles', null, {});

  }
};
