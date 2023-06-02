module.exports = (sequelize, DataTypes) => {
  const Medicine = sequelize.define('Medicine', {
    uidMedicine: {
      field: 'uid_medicine',
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    uidPatient: {
      field: 'uid_patient',
      type: DataTypes.STRING(14),
      allowNull: false,
    },
    medicine: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    preparation: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    dosage: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    rules: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ['requested', 'prepared', 'finished', 'canceled'],
      allowNull: false,
    },
    createdBy: {
      field: 'created_by',
      type: DataTypes.STRING,
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
    tableName: 'medicine',
    timestamps: true,
  });

  return Medicine;
};
