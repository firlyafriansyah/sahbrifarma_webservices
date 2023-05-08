module.exports = (sequelize, DataTypes) => {
  const Patient = sequelize.define('Patient', {
    uidPatient: {
      field: 'uid_patient',
      type: DataTypes.STRING(14),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      field: 'phone_number',
      type: DataTypes.STRING(14),
    },
    emergencyPhoneNumber: {
      field: 'emergency_phone_number',
      type: DataTypes.STRING(14),
    },
    dateOfBirth: {
      field: 'date_of_birth',
      type: DataTypes.DATE,
      allowNull: false,
    },
    sex: {
      type: DataTypes.ENUM,
      values: ['Laki - Laki', 'Perempuan'],
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
    tableName: 'patient',
    timestamps: true,
  });

  return Patient;
};
