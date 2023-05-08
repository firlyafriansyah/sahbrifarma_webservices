module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medicine', {
      uid: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uid_patient: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      medicine: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      preparations: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dosage: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      rules: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: ['requested', 'prepared', 'finished'],
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
