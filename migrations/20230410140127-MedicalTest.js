module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('medical_test', {
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
      body_height: {
        type: Sequelize.INTEGER,
      },
      body_weight: {
        type: Sequelize.INTEGER,
      },
      blood_preasure: {
        type: Sequelize.STRING,
      },
      blood_sugar: {
        type: Sequelize.INTEGER,
      },
      uric_acid: {
        type: Sequelize.INTEGER,
      },
      cholesterol: {
        type: Sequelize.INTEGER,
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
