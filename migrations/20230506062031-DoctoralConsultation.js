module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('doctoral_consulation', {
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
      allergies: {
        type: Sequelize.STRING,
      },
      anamnesis: {
        type: Sequelize.STRING,
      },
      diagnosis: {
        type: Sequelize.STRING,
      },
      notes: {
        type: Sequelize.STRING,
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

  async down(queryInterface) {
    await queryInterface.dropTable('doctoral_consulation');
  },
};
