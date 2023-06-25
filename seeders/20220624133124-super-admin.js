const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert('administration_account', [{
      username: 'super-admin',
      password: await bcrypt.hash('superadmin123', 10),
      role: 'super-admin',
      fullname: 'Fikri Sahbri',
      date_of_birth: '1993-05-23',
      sex: 'Laki - Laki',
      status: 'active',
      created_at: new Date(),
      updated_at: new Date(),
    }]);
    await queryInterface.bulkInsert('login_status', [{
      uid_administration_account: 1,
      logged_in: false,
      created_at: new Date(),
      updated_at: new Date(),
    }]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('administration_account', null, {});
  },
};
