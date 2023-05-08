module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medical_test', {
      uid_medical_test: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uid_patient: {
        type: Sequelize.STRING(14),
        allowNull: false,
      },
      body_height: {
        type: Sequelize.FLOAT,
      },
      body_weight: {
        type: Sequelize.FLOAT,
      },
      body_temperature: {
        type: Sequelize.FLOAT,
      },
      blood_pressure: {
        type: Sequelize.STRING(10),
      },
      blood_sugar: {
        type: Sequelize.FLOAT,
      },
      uric_acid: {
        type: Sequelize.FLOAT,
      },
      cholesterol: {
        type: Sequelize.FLOAT,
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
    await queryInterface.dropTable('medical_test');
  },
};
