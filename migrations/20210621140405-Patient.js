module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('patient', {
      uid_patient: {
        type: Sequelize.STRING(14),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      phone_number: {
        type: Sequelize.STRING(14),
      },
      emergency_phone_number: {
        type: Sequelize.STRING(14),
      },
      date_of_birth: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      sex: {
        type: Sequelize.ENUM,
        values: ['Laki - Laki', 'Perempuan'],
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
    await queryInterface.addConstraint('patient', {
      type: 'unique',
      fields: ['uid_patient'],
      name: 'UNIQUE_UID_PATIENT',
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('patient');
  },
};
