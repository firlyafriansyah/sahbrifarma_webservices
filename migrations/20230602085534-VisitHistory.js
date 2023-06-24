/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('visit_history', {
      uid_visit_history: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
      uid_patient: {
        type: Sequelize.STRING(14),
        allowNull: false,
      },
      visit_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      medical_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: ['on_progress', 'canceled', 'finish'],
        defaultValue: 'canceled',
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

  async down(queryInterface) {
    await queryInterface.dropTable('visit_history');
  },
};
