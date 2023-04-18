const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('administration_account', [{
      username: 'super-admin',
      password: await bcrypt.hash('superadmin123', 10),
      role: 'super-admin',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('administration_account', null, {});
  },
};
