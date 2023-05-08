module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('doctoral_consultation', {
      uid_doctoral_consultation: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uid_patient: {
        type: Sequelize.STRING(14),
        allowNull: false,
      },
      allergies: {
        type: Sequelize.STRING,
      },
      anamnesis: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      diagnosis: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT('long'),
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
    await queryInterface.dropTable('doctoral_consultation');
  },
};
