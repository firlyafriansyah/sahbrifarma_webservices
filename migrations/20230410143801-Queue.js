module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('queue', {
      uid_queue: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      uid_patient: {
        type: Sequelize.STRING(14),
        allowNull: false,
      },
      patient_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: ['in_medical_test_queue', 'in_doctoral_consultation_queue', 'in_pharmacist_queue', 'out_of_queue'],
        allowNull: false,
        defaultValue: 'out_of_queue',
      },
      sex: {
        type: Sequelize.ENUM,
        values: ['Laki - Laki', 'Perempuan'],
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
    await queryInterface.dropTable('queue');
  },
};
