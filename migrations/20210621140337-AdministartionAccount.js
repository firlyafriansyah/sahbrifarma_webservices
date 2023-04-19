module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('administration_account', {
      uid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.ENUM,
        values: ['super-admin', 'frontdesk', 'nurse', 'doctor', 'pharmacist'],
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: ['active', 'inactive'],
        allowNull: false,
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
    await queryInterface.addConstraint('administration_account', {
      type: 'unique',
      fields: ['username'],
      name: 'UNIQUE_ADMIN_USERNAME',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('administration_account');
  },
};
