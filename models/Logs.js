module.exports = (sequelize, DataTypes) => {
  const Logs = sequelize.define('Logs', {
    uid_logs: {
      field: 'uid_logs',
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    uidAdministrationAccount: {
      field: 'uid_administration_account',
      type: DataTypes.INTEGER,
    },
    uidPatient: {
      field: 'uid_patient',
      type: DataTypes.STRING(14),
    },
    action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ['success', 'error'],
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    createdAt: {
      field: 'created_at',
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      field: 'updated_at',
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    tableName: 'logs',
    timestamps: true,
  });

  return Logs;
};
