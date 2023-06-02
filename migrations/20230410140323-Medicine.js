module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medicine', {
      uid_medicine: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uid_patient: {
        type: Sequelize.STRING(14),
        allowNull: false,
      },
      medicine: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      preparation: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      dosage: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      rules: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: ['requested', 'prepared', 'finished', 'canceled'],
        allowNull: false,
      },
      created_by: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('medicine');
  },
};
