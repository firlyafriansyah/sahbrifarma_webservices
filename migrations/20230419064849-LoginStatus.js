module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('login_status', {
      uid_login_status: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uid_administration_account: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      logged_in: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      last_update: {
        type: Sequelize.DATE,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
    await queryInterface.addConstraint('login_status', {
      type: 'unique',
      fields: ['uid_administration_account'],
      name: 'UNIQUE_UID_ADMINISTRATION_ACCOUNT',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('login_status');
  },
};
