module.exports = (sequelize, DataTypes) => {
  const Medicine = sequelize.define('Medicine', {
    uid: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    uidPatient: {
      field: 'uid_patient',
      type: DataTypes.STRING,
      allowNull: false,
    },
    medicine: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    preparations: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dosage: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rules: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM,
      values: ['requested', 'prepared', 'finished'],
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
