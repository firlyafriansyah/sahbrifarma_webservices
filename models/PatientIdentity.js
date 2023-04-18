module.exports = (sequelize, DataTypes) => {
  const PatientIdentity = sequelize.define('PatientIdentity', {
    uid: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneNumber: {
      field: 'phone_number',
      type: DataTypes.STRING,
    },
    emergencyPhoneNumber: {
      field: 'emergency_phone_number',
      type: DataTypes.STRING,
    },
    dateOfBirth: {
      field: 'date_of_birth',
      type: DataTypes.STRING,
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
    tableName: 'patient_identity',
    timestamps: true,
  });

  return PatientIdentity;
};
