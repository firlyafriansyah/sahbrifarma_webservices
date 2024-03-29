module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('logs', {
      uid_logs: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uid_executor: {
        type: Sequelize.STRING(20),
      },
      uid_target: {
        type: Sequelize.STRING(20),
      },
      action: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: ['success', 'error'],
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT('long'),
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
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('logs');
  },
};
