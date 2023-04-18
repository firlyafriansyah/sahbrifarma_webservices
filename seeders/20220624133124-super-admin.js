'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('admin', [{
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      role: 0,
      created_at: new Date(),
      updated_at: new Date(),
      }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('admin', null, {});
  }
};
